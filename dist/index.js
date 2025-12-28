// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "https://api.manus.im",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/llm.ts
async function invokeLLM(params) {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.");
  }
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.max_tokens ?? 2048
        })
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[LLM] API Error:", errorData);
      throw new Error(`LLM invoke failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from LLM API");
    }
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("[LLM] Error:", error.message);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    throw error;
  }
}

// client/src/lib/subjects.ts
var subjects = {
  mathematics: {
    id: "mathematics",
    nameAr: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A",
    nameEn: "Mathematics",
    descriptionAr: "\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0644\u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0648\u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A",
    descriptionEn: "Numbers, equations, and calculations",
    color: "#8B0000",
    bgColor: "bg-red-900",
    textColor: "text-red-50",
    accentColor: "from-red-900 to-red-700",
    icon: "calculator",
    // Using lucide-react icon name
    image: "/subjects/mathematics-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0644\u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0627\u0644\u062F\u0642\u064A\u0642\u0629! \u{1F522}",
    aiGreetingEn: "Welcome to the world of numbers and equations! \u{1F522}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0630\u0643\u064A \u0648\u0645\u062A\u062E\u0635\u0635. \u062A\u0634\u0631\u062D \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629 \u0628\u0637\u0631\u064A\u0642\u0629 \u0648\u0627\u0636\u062D\u0629 \u0648\u0633\u0647\u0644\u0629 \u0627\u0644\u0641\u0647\u0645. \u062A\u0642\u062F\u0645 \u0623\u0645\u062B\u0644\u0629 \u0639\u0645\u0644\u064A\u0629 \u0648\u062E\u0637\u0648\u0627\u062A \u062D\u0644 \u0645\u0641\u0635\u0644\u0629.",
    systemPromptEn: "You are an intelligent mathematics teacher. Explain mathematical concepts clearly and simply. Provide practical examples and detailed solution steps."
  },
  physics: {
    id: "physics",
    nameAr: "\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621",
    nameEn: "Physics",
    descriptionAr: "\u0627\u0644\u062D\u0631\u0643\u0629 \u0648\u0627\u0644\u0642\u0648\u0649 \u0648\u0627\u0644\u0637\u0627\u0642\u0629",
    descriptionEn: "Motion, forces, and energy",
    color: "#1E40AF",
    bgColor: "bg-blue-900",
    textColor: "text-blue-50",
    accentColor: "from-blue-900 to-blue-700",
    icon: "zap",
    // Using lucide-react icon name
    image: "/subjects/physics-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u062D\u0631\u0643\u0629 \u0648\u0627\u0644\u0642\u0648\u0649 \u0648\u0627\u0644\u0637\u0627\u0642\u0629! \u26A1",
    aiGreetingEn: "Welcome to the world of motion, forces, and energy! \u26A1",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0641\u064A\u0632\u064A\u0627\u0621 \u0645\u062A\u062E\u0635\u0635 \u0648\u0630\u0643\u064A. \u062A\u0634\u0631\u062D \u0627\u0644\u0638\u0648\u0627\u0647\u0631 \u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0626\u064A\u0629 \u0628\u0637\u0631\u064A\u0642\u0629 \u0645\u0628\u0633\u0637\u0629 \u0645\u0639 \u0623\u0645\u062B\u0644\u0629 \u0645\u0646 \u0627\u0644\u062D\u064A\u0627\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629.",
    systemPromptEn: "You are an intelligent physics teacher. Explain physical phenomena simply with real-world examples."
  },
  chemistry: {
    id: "chemistry",
    nameAr: "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621",
    nameEn: "Chemistry",
    descriptionAr: "\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0648\u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A",
    descriptionEn: "Elements, compounds, and reactions",
    color: "#4A148C",
    bgColor: "bg-purple-900",
    textColor: "text-purple-50",
    accentColor: "from-purple-900 to-purple-700",
    icon: "flask",
    // Using lucide-react icon name
    image: "/subjects/chemistry-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0648\u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0626\u064A\u0629! \u{1F9EA}",
    aiGreetingEn: "Welcome to the world of elements and chemical reactions! \u{1F9EA}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0643\u064A\u0645\u064A\u0627\u0621 \u0645\u062A\u062E\u0635\u0635. \u062A\u0634\u0631\u062D \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0648\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0628\u0637\u0631\u064A\u0642\u0629 \u0648\u0627\u0636\u062D\u0629 \u0645\u0639 \u0645\u0639\u0627\u062F\u0644\u0627\u062A \u0645\u0648\u0632\u0648\u0646\u0629.",
    systemPromptEn: "You are an intelligent chemistry teacher. Explain reactions and elements clearly with balanced equations."
  },
  biology: {
    id: "biology",
    nameAr: "\u0627\u0644\u0623\u062D\u064A\u0627\u0621",
    nameEn: "Biology",
    descriptionAr: "\u0627\u0644\u062D\u064A\u0627\u0629 \u0648\u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062A \u0627\u0644\u062D\u064A\u0629",
    descriptionEn: "Life and living organisms",
    color: "#004D40",
    bgColor: "bg-teal-900",
    textColor: "text-teal-50",
    accentColor: "from-teal-900 to-teal-700",
    icon: "dna",
    // Using lucide-react icon name
    image: "/subjects/biology-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0631\u062D\u0644\u0629 \u0627\u0644\u062D\u064A\u0627\u0629 \u0648\u0627\u0644\u0627\u0643\u062A\u0634\u0627\u0641\u0627\u062A \u0627\u0644\u0628\u064A\u0648\u0644\u0648\u062C\u064A\u0629! \u{1F52C}",
    aiGreetingEn: "Welcome to the journey of life and biology discoveries! \u{1F52C}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0623\u062D\u064A\u0627\u0621 \u0645\u062A\u062E\u0635\u0635 \u0648\u0634\u063A\u0648\u0641. \u062A\u0634\u0631\u062D \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0628\u064A\u0648\u0644\u0648\u062C\u064A\u0629 \u0648\u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062A \u0627\u0644\u062D\u064A\u0629 \u0628\u0637\u0631\u064A\u0642\u0629 \u0645\u0634\u0648\u0642\u0629.",
    systemPromptEn: "You are an intelligent and passionate biology teacher. Explain biological processes and organisms engagingly."
  },
  arabic: {
    id: "arabic",
    nameAr: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    nameEn: "Arabic",
    descriptionAr: "\u0627\u0644\u0646\u062D\u0648 \u0648\u0627\u0644\u0623\u062F\u0628 \u0648\u0627\u0644\u0644\u063A\u0629",
    descriptionEn: "Grammar, literature, and language",
    color: "#E65100",
    bgColor: "bg-orange-900",
    textColor: "text-orange-50",
    accentColor: "from-orange-900 to-orange-700",
    icon: "book-open",
    // Using lucide-react icon name
    image: "/subjects/arabic-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u062C\u0645\u064A\u0644! \u{1F4D6}",
    aiGreetingEn: "Welcome to the beautiful world of Arabic language! \u{1F4D6}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629 \u0645\u062A\u062E\u0635\u0635 \u0648\u0623\u062F\u064A\u0628. \u062A\u0634\u0631\u062D \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0646\u062D\u0648 \u0648\u0627\u0644\u0623\u062F\u0628 \u0628\u0637\u0631\u064A\u0642\u0629 \u0633\u0644\u0633\u0629 \u0648\u0645\u0645\u062A\u0639\u0629.",
    systemPromptEn: "You are an intelligent Arabic language teacher. Explain grammar and literature clearly and engagingly."
  },
  english: {
    id: "english",
    nameAr: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629",
    nameEn: "English",
    descriptionAr: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0648\u0627\u0644\u0642\u0648\u0627\u0639\u0633",
    descriptionEn: "English language and grammar",
    color: "#0277BD",
    bgColor: "bg-blue-700",
    textColor: "text-blue-50",
    accentColor: "from-blue-700 to-blue-500",
    icon: "globe",
    // Using lucide-react icon name
    image: "/subjects/english-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629! \u{1F30D}",
    aiGreetingEn: "Welcome to the world of English language! \u{1F30D}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0644\u063A\u0629 \u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0645\u062A\u062E\u0635\u0635. \u062A\u0634\u0631\u062D \u0627\u0644\u0642\u0648\u0627\u0639\u0633 \u0648\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0628\u0637\u0631\u064A\u0642\u0629 \u0633\u0647\u0644\u0629 \u0648\u0641\u0639\u0627\u0644\u0629.",
    systemPromptEn: "You are an intelligent English teacher. Explain grammar and vocabulary clearly and effectively."
  },
  islamic: {
    id: "islamic",
    nameAr: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629",
    nameEn: "Islamic Education",
    descriptionAr: "\u0627\u0644\u062F\u064A\u0646 \u0648\u0627\u0644\u0623\u062E\u0644\u0627\u0642 \u0648\u0627\u0644\u0639\u0628\u0627\u062F\u0629",
    descriptionEn: "Religion, ethics, and worship",
    color: "#2E7D32",
    bgColor: "bg-green-700",
    textColor: "text-green-50",
    accentColor: "from-green-700 to-green-500",
    icon: "book-open",
    // Using lucide-react icon name
    image: "/subjects/islamic-education-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A! \u{1F54C}",
    aiGreetingEn: "Welcome to the journey of Islamic education! \u{1F54C}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u062A\u0631\u0628\u064A\u0629 \u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0645\u062A\u062E\u0635\u0635 \u0648\u062D\u0643\u064A\u0645. \u062A\u0634\u0631\u062D \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0628\u062D\u0643\u0645\u0629 \u0648\u0639\u0645\u0642.",
    systemPromptEn: "You are an intelligent Islamic education teacher. Explain Islamic concepts with wisdom and depth."
  },
  social: {
    id: "social",
    nameAr: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629",
    nameEn: "Social Studies",
    descriptionAr: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0627 \u0648\u0627\u0644\u0645\u062C\u062A\u0645\u0639",
    descriptionEn: "History, geography, and society",
    color: "#6D4C41",
    bgColor: "bg-amber-900",
    textColor: "text-amber-50",
    accentColor: "from-amber-900 to-amber-700",
    icon: "globe",
    // Using lucide-react icon name
    image: "/subjects/social-studies-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0627! \u{1F5FA}\uFE0F",
    aiGreetingEn: "Welcome to the journey of history and geography! \u{1F5FA}\uFE0F",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u062F\u0631\u0627\u0633\u0627\u062A \u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629 \u0645\u062A\u062E\u0635\u0635. \u062A\u0634\u0631\u062D \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0627 \u0628\u0637\u0631\u064A\u0642\u0629 \u0634\u064A\u0642\u0629 \u0648\u062A\u0641\u0627\u0639\u0644\u064A\u0629.",
    systemPromptEn: "You are an intelligent social studies teacher. Explain history and geography engagingly and interactively."
  },
  physical: {
    id: "physical",
    nameAr: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0628\u062F\u0646\u064A\u0629",
    nameEn: "Physical Education",
    descriptionAr: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0648\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0628\u062F\u0646\u064A",
    descriptionEn: "Sports and physical activity",
    color: "#FFD700",
    bgColor: "bg-yellow-500",
    textColor: "text-yellow-900",
    accentColor: "from-yellow-500 to-yellow-400",
    icon: "activity",
    image: "/subjects/pe-sports-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0648\u0627\u0644\u0644\u064A\u0627\u0642\u0629 \u0627\u0644\u0628\u062F\u0646\u064A\u0629! \u26BD",
    aiGreetingEn: "Welcome to the world of sports and fitness! \u26BD",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u062A\u0631\u0628\u064A\u0629 \u0628\u062F\u0646\u064A\u0629 \u0645\u062A\u062E\u0635\u0635 \u0648\u062D\u0645\u0627\u0633\u064A. \u062A\u0634\u0631\u062D \u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0648\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0628\u062F\u0646\u064A \u0628\u0637\u0631\u064A\u0642\u0629 \u0645\u0634\u0648\u0642\u0629 \u0648\u0622\u0645\u0646\u0629.",
    systemPromptEn: "You are an intelligent and enthusiastic physical education teacher. Explain sports techniques and physical activity safely and engagingly."
  },
  health: {
    id: "health",
    nameAr: "\u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0635\u062D\u064A\u0629",
    nameEn: "Health Sciences",
    descriptionAr: "\u0627\u0644\u0635\u062D\u0629 \u0648\u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0639\u0627\u0641\u064A\u0629",
    descriptionEn: "Health, nutrition, and wellness",
    color: "#00CED1",
    bgColor: "bg-cyan-600",
    textColor: "text-cyan-50",
    accentColor: "from-cyan-600 to-cyan-500",
    icon: "heart",
    image: "/subjects/health-sciences-card.png",
    aiGreetingAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0627\u0644\u0639\u0627\u0641\u064A\u0629! \u{1F49A}",
    aiGreetingEn: "Welcome to the world of health sciences and wellness! \u{1F49A}",
    systemPromptAr: "\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u0639\u0644\u0648\u0645 \u0635\u062D\u064A\u0629 \u0645\u062A\u062E\u0635\u0635 \u0648\u0639\u0627\u0631\u0641. \u062A\u0634\u0631\u062D \u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0635\u062D\u0629 \u0648\u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0639\u0627\u0641\u064A\u0629 \u0628\u0637\u0631\u064A\u0642\u0629 \u0639\u0644\u0645\u064A\u0629 \u0648\u0633\u0647\u0644\u0629 \u0627\u0644\u0641\u0647\u0645.",
    systemPromptEn: "You are an intelligent health sciences teacher. Explain health, nutrition, and wellness concepts scientifically and clearly."
  }
};

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  ai: router({
    chat: publicProcedure.input(
      z2.object({
        subjectId: z2.string(),
        message: z2.string(),
        language: z2.enum(["ar", "en"])
      })
    ).mutation(async ({ input }) => {
      const { subjectId, message, language } = input;
      const subject = subjects[subjectId];
      if (!subject) {
        throw new Error("Subject not found");
      }
      const systemPrompt = language === "ar" ? subject.systemPromptAr : subject.systemPromptEn;
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ]
        });
        const reply = response.content || "No response received";
        return {
          reply: typeof reply === "string" ? reply : JSON.stringify(reply),
          success: true
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error calling Gemini API:", errorMessage);
        throw new Error(`Failed to get AI response: ${errorMessage}`);
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var htmlEnvPlugin = () => ({
  name: "html-env-plugin",
  transformIndexHtml(html) {
    const appTitle = process.env.VITE_APP_TITLE || "Al Falah Academy";
    const appLogo = process.env.VITE_APP_LOGO || "/al-falah-logo.png";
    const analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT || "";
    const analyticsWebsiteId = process.env.VITE_ANALYTICS_WEBSITE_ID || "";
    return html.replace(/%VITE_APP_TITLE%/g, appTitle).replace(/%VITE_APP_LOGO%/g, appLogo).replace(/%VITE_ANALYTICS_ENDPOINT%/g, analyticsEndpoint).replace(/%VITE_ANALYTICS_WEBSITE_ID%/g, analyticsWebsiteId);
  }
});
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), htmlEnvPlugin()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
