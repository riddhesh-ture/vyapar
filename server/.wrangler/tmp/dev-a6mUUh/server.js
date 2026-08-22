var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/partyserver/dist/index.js
import { DurableObject, env } from "cloudflare:workers";

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.browser.js
var nanoid = /* @__PURE__ */ __name((size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}, "nanoid");

// node_modules/partyserver/dist/index.js
if (!("OPEN" in WebSocket)) {
  const WebSocketStatus = {
    CONNECTING: WebSocket.READY_STATE_CONNECTING,
    OPEN: WebSocket.READY_STATE_OPEN,
    CLOSING: WebSocket.READY_STATE_CLOSING,
    CLOSED: WebSocket.READY_STATE_CLOSED
  };
  Object.assign(WebSocket, WebSocketStatus);
  Object.assign(WebSocket.prototype, WebSocketStatus);
}
function tryGetPartyServerMeta(ws) {
  try {
    const attachment = WebSocket.prototype.deserializeAttachment.call(ws);
    if (!attachment || typeof attachment !== "object") return null;
    if (!("__pk" in attachment)) return null;
    const pk = attachment.__pk;
    if (!pk || typeof pk !== "object") return null;
    const { id, tags } = pk;
    if (typeof id !== "string") return null;
    const { uri } = pk;
    return {
      id,
      tags: Array.isArray(tags) ? tags : [],
      uri: typeof uri === "string" ? uri : void 0
    };
  } catch {
    return null;
  }
}
__name(tryGetPartyServerMeta, "tryGetPartyServerMeta");
function isPartyServerWebSocket(ws) {
  return tryGetPartyServerMeta(ws) !== null;
}
__name(isPartyServerWebSocket, "isPartyServerWebSocket");
var AttachmentCache = class {
  static {
    __name(this, "AttachmentCache");
  }
  #cache = /* @__PURE__ */ new WeakMap();
  get(ws) {
    let attachment = this.#cache.get(ws);
    if (!attachment) {
      attachment = WebSocket.prototype.deserializeAttachment.call(ws);
      if (attachment !== void 0) this.#cache.set(ws, attachment);
      else throw new Error("Missing websocket attachment. This is most likely an issue in PartyServer, please open an issue at https://github.com/cloudflare/partykit/issues");
    }
    return attachment;
  }
  set(ws, attachment) {
    this.#cache.set(ws, attachment);
    WebSocket.prototype.serializeAttachment.call(ws, attachment);
  }
};
var attachments = new AttachmentCache();
var connections = /* @__PURE__ */ new WeakSet();
var isWrapped = /* @__PURE__ */ __name((ws) => {
  return connections.has(ws);
}, "isWrapped");
var createLazyConnection = /* @__PURE__ */ __name((ws) => {
  if (isWrapped(ws)) return ws;
  let initialState;
  if ("state" in ws) {
    initialState = ws.state;
    delete ws.state;
  }
  const connection = Object.defineProperties(ws, {
    id: {
      configurable: true,
      get() {
        return attachments.get(ws).__pk.id;
      }
    },
    uri: {
      configurable: true,
      get() {
        return attachments.get(ws).__pk.uri ?? null;
      }
    },
    tags: {
      configurable: true,
      get() {
        return attachments.get(ws).__pk.tags ?? [];
      }
    },
    socket: {
      configurable: true,
      get() {
        return ws;
      }
    },
    state: {
      configurable: true,
      get() {
        return ws.deserializeAttachment();
      }
    },
    setState: {
      configurable: true,
      value: /* @__PURE__ */ __name(function setState(setState) {
        let state;
        if (setState instanceof Function) state = setState(this.state);
        else state = setState;
        ws.serializeAttachment(state);
        return state;
      }, "setState")
    },
    deserializeAttachment: {
      configurable: true,
      value: /* @__PURE__ */ __name(function deserializeAttachment() {
        return attachments.get(ws).__user ?? null;
      }, "deserializeAttachment")
    },
    serializeAttachment: {
      configurable: true,
      value: /* @__PURE__ */ __name(function serializeAttachment(attachment) {
        const setting = {
          ...attachments.get(ws),
          __user: attachment ?? null
        };
        attachments.set(ws, setting);
      }, "serializeAttachment")
    }
  });
  if (initialState) connection.setState(initialState);
  connections.add(connection);
  return connection;
}, "createLazyConnection");
var HibernatingConnectionIterator = class {
  static {
    __name(this, "HibernatingConnectionIterator");
  }
  index = 0;
  sockets;
  constructor(state, tag) {
    this.state = state;
    this.tag = tag;
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const sockets = this.sockets ?? (this.sockets = this.state.getWebSockets(this.tag));
    let socket;
    while (socket = sockets[this.index++]) if (socket.readyState === WebSocket.READY_STATE_OPEN) {
      if (!isPartyServerWebSocket(socket)) continue;
      return {
        done: false,
        value: createLazyConnection(socket)
      };
    }
    return {
      done: true,
      value: void 0
    };
  }
};
function prepareTags(connectionId, userTags) {
  const tags = [connectionId, ...userTags.filter((t) => t !== connectionId)];
  if (tags.length > 10) throw new Error("A connection can only have 10 tags, including the default id tag.");
  for (const tag of tags) {
    if (typeof tag !== "string") throw new Error(`A connection tag must be a string. Received: ${tag}`);
    if (tag === "") throw new Error("A connection tag must not be an empty string.");
    if (tag.length > 256) throw new Error("A connection tag must not exceed 256 characters");
  }
  return tags;
}
__name(prepareTags, "prepareTags");
var InMemoryConnectionManager = class {
  static {
    __name(this, "InMemoryConnectionManager");
  }
  #connections = /* @__PURE__ */ new Map();
  tags = /* @__PURE__ */ new WeakMap();
  getCount() {
    return this.#connections.size;
  }
  getConnection(id) {
    return this.#connections.get(id);
  }
  *getConnections(tag) {
    if (!tag) {
      yield* this.#connections.values().filter((c) => c.readyState === WebSocket.READY_STATE_OPEN);
      return;
    }
    for (const connection of this.#connections.values()) if ((this.tags.get(connection) ?? []).includes(tag)) yield connection;
  }
  accept(connection, options) {
    try {
      connection.accept({ allowHalfOpen: true });
    } catch {
      connection.accept();
    }
    try {
      connection.binaryType = "arraybuffer";
    } catch {
    }
    const tags = prepareTags(connection.id, options.tags);
    this.#connections.set(connection.id, connection);
    this.tags.set(connection, tags);
    Object.defineProperty(connection, "tags", {
      get: /* @__PURE__ */ __name(() => tags, "get"),
      configurable: true
    });
    const removeConnection = /* @__PURE__ */ __name(() => {
      this.#connections.delete(connection.id);
      connection.removeEventListener("close", removeConnection);
      connection.removeEventListener("error", removeConnection);
    }, "removeConnection");
    connection.addEventListener("close", removeConnection);
    connection.addEventListener("error", removeConnection);
    return connection;
  }
};
var HibernatingConnectionManager = class {
  static {
    __name(this, "HibernatingConnectionManager");
  }
  constructor(controller) {
    this.controller = controller;
  }
  getCount() {
    let count = 0;
    for (const ws of this.controller.getWebSockets()) if (isPartyServerWebSocket(ws)) count++;
    return count;
  }
  getConnection(id) {
    const matching = this.controller.getWebSockets(id).filter((ws) => {
      return tryGetPartyServerMeta(ws)?.id === id;
    });
    if (matching.length === 0) return void 0;
    if (matching.length === 1) return createLazyConnection(matching[0]);
    throw new Error(`More than one connection found for id ${id}. Did you mean to use getConnections(tag) instead?`);
  }
  getConnections(tag) {
    return new HibernatingConnectionIterator(this.controller, tag);
  }
  accept(connection, options) {
    const tags = prepareTags(connection.id, options.tags);
    this.controller.acceptWebSocket(connection, tags);
    connection.serializeAttachment({
      __pk: {
        id: connection.id,
        tags,
        uri: connection.uri ?? void 0
      },
      __user: null
    });
    return createLazyConnection(connection);
  }
};
var CLOSING = 2;
var CLOSED = 3;
function isBenignTeardownError(ws, error) {
  const state = ws.readyState;
  if (state !== CLOSING && state !== CLOSED) return false;
  if (typeof error !== "object" || error === null) return false;
  const typed = error;
  if (typed.retryable === true) return true;
  const message = typeof typed.message === "string" ? typed.message : "";
  return /Network connection lost|WebSocket peer disconnected/i.test(message);
}
__name(isBenignTeardownError, "isBenignTeardownError");
var NAME_STORAGE_KEY = "__ps_name";
function isReservedCloseCode(code) {
  return code === 1005 || code === 1006 || code === 1015;
}
__name(isReservedCloseCode, "isReservedCloseCode");
function closeQuietly(ws, code, reason) {
  if (isReservedCloseCode(code)) return;
  try {
    ws.close(code, reason);
  } catch {
  }
}
__name(closeQuietly, "closeQuietly");
var serverMapCache = /* @__PURE__ */ new WeakMap();
var bindingNameCache = /* @__PURE__ */ new WeakMap();
var DEFAULT_ROUTING_RETRY_OPTIONS = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 800
};
function durableObjectGetOptions(options) {
  return options?.locationHint ? { locationHint: options.locationHint } : void 0;
}
__name(durableObjectGetOptions, "durableObjectGetOptions");
function validatePositiveInteger(value, name) {
  if (!Number.isFinite(value) || value < 1) throw new Error(`${name} must be >= 1`);
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`);
}
__name(validatePositiveInteger, "validatePositiveInteger");
function validatePositiveNumber(value, name) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be > 0`);
}
__name(validatePositiveNumber, "validatePositiveNumber");
function resolveRoutingRetryOptions(options) {
  if (options === false) return null;
  const resolved = {
    maxAttempts: options?.maxAttempts ?? DEFAULT_ROUTING_RETRY_OPTIONS.maxAttempts,
    baseDelayMs: options?.baseDelayMs ?? DEFAULT_ROUTING_RETRY_OPTIONS.baseDelayMs,
    maxDelayMs: options?.maxDelayMs ?? DEFAULT_ROUTING_RETRY_OPTIONS.maxDelayMs,
    onRetry: options?.onRetry
  };
  validatePositiveInteger(resolved.maxAttempts, "routingRetry.maxAttempts");
  validatePositiveNumber(resolved.baseDelayMs, "routingRetry.baseDelayMs");
  validatePositiveNumber(resolved.maxDelayMs, "routingRetry.maxDelayMs");
  if (resolved.baseDelayMs > resolved.maxDelayMs) throw new Error("routingRetry.baseDelayMs must be <= maxDelayMs");
  return resolved;
}
__name(resolveRoutingRetryOptions, "resolveRoutingRetryOptions");
function isRetryableDurableObjectError(error) {
  if (typeof error !== "object" || error === null) return false;
  const typed = error;
  return typed.retryable === true && typed.overloaded !== true;
}
__name(isRetryableDurableObjectError, "isRetryableDurableObjectError");
function routingRetryDelayMs(attempt, options) {
  const upperBoundMs = Math.min(options.maxDelayMs, options.baseDelayMs * 2 ** (attempt - 1));
  return Math.floor(Math.random() * upperBoundMs);
}
__name(routingRetryDelayMs, "routingRetryDelayMs");
async function retryDurableObjectOperation(operation, context, retryOptions) {
  const resolved = resolveRoutingRetryOptions(retryOptions);
  if (!resolved) return await operation();
  let attempt = 1;
  while (true) try {
    return await operation();
  } catch (error) {
    const nextAttempt = attempt + 1;
    if (nextAttempt > resolved.maxAttempts || !isRetryableDurableObjectError(error)) throw error;
    const delayMs = routingRetryDelayMs(attempt, resolved);
    try {
      await resolved.onRetry?.({
        error,
        attempt,
        maxAttempts: resolved.maxAttempts,
        delayMs,
        name: context.name,
        className: context.className
      });
    } catch (callbackError) {
      console.warn("PartyServer routingRetry onRetry callback failed:", callbackError);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    attempt = nextAttempt;
  }
}
__name(retryDurableObjectOperation, "retryDurableObjectOperation");
function encodeProps(props) {
  const bytes = new TextEncoder().encode(JSON.stringify(props));
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
__name(encodeProps, "encodeProps");
function decodeProps(header) {
  const trimmed = header.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return JSON.parse(trimmed);
  const binary = atob(header);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
__name(decodeProps, "decodeProps");
function camelCaseToKebabCase(str) {
  if (str === str.toUpperCase() && str !== str.toLowerCase()) return str.toLowerCase().replace(/_/g, "-");
  let kebabified = str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  kebabified = kebabified.startsWith("-") ? kebabified.slice(1) : kebabified;
  return kebabified.replace(/_/g, "-").replace(/-$/, "");
}
__name(camelCaseToKebabCase, "camelCaseToKebabCase");
function resolveCorsHeaders(cors) {
  if (cors === true) return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400"
  };
  if (cors && typeof cors === "object") {
    const h = new Headers(cors);
    const record = {};
    h.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  return null;
}
__name(resolveCorsHeaders, "resolveCorsHeaders");
async function routePartykitRequest(req, env$1 = env, options) {
  if (!serverMapCache.has(env$1)) {
    const namespaceMap = {};
    const bindingNames2 = {};
    for (const [k, v] of Object.entries(env$1)) if (v && typeof v === "object" && "idFromName" in v && typeof v.idFromName === "function") {
      const kebab = camelCaseToKebabCase(k);
      namespaceMap[kebab] = v;
      bindingNames2[kebab] = k;
    }
    serverMapCache.set(env$1, namespaceMap);
    bindingNameCache.set(env$1, bindingNames2);
  }
  const map = serverMapCache.get(env$1);
  const bindingNames = bindingNameCache.get(env$1);
  const prefixParts = (options?.prefix || "parties").split("/");
  const parts = new URL(req.url).pathname.split("/").filter(Boolean);
  if (!prefixParts.every((part, index) => parts[index] === part) || parts.length < prefixParts.length + 2) return null;
  const namespace = parts[prefixParts.length];
  const name = parts[prefixParts.length + 1];
  if (name && namespace) {
    let withCorsHeaders = function(response2) {
      if (!corsHeaders || isWebSocket) return response2;
      const newResponse = new Response(response2.body, response2);
      for (const [key, value] of Object.entries(corsHeaders)) newResponse.headers.set(key, value);
      return newResponse;
    };
    __name(withCorsHeaders, "withCorsHeaders");
    if (!map[namespace]) {
      if (namespace === "main") {
        console.warn("You appear to be migrating a PartyKit project to PartyServer.");
        console.warn(`PartyServer doesn't have a "main" party by default. Try adding this to your PartySocket client:
 
party: "${camelCaseToKebabCase(Object.keys(map)[0])}"`);
      } else console.error(`The url ${req.url}  with namespace "${namespace}" and name "${name}" does not match any server namespace. 
Did you forget to add a durable object binding to the class ${namespace[0].toUpperCase() + namespace.slice(1)} in your wrangler.jsonc?`);
      return new Response("Invalid request", { status: 400 });
    }
    const corsHeaders = resolveCorsHeaders(options?.cors);
    const isWebSocket = req.headers.get("Upgrade")?.toLowerCase() === "websocket";
    if (req.method === "OPTIONS" && corsHeaders) return new Response(null, { headers: corsHeaders });
    let doNamespace = map[namespace];
    if (options?.jurisdiction) doNamespace = doNamespace.jurisdiction(options.jurisdiction);
    const id = doNamespace.idFromName(name);
    const getOptions = durableObjectGetOptions(options);
    req = new Request(req);
    req.headers.set("x-partykit-namespace", namespace);
    if (options?.jurisdiction) req.headers.set("x-partykit-jurisdiction", options.jurisdiction);
    const className = bindingNames[namespace];
    let partyDeprecationWarned = false;
    const lobby = {
      get party() {
        if (!partyDeprecationWarned) {
          partyDeprecationWarned = true;
          console.warn('lobby.party is deprecated and currently returns the kebab-case namespace (e.g. "my-agent"). Use lobby.className instead to get the Durable Object class name (e.g. "MyAgent"). In the next major version, lobby.party will return the class name.');
        }
        return namespace;
      },
      className,
      name
    };
    if (isWebSocket) {
      if (options?.onBeforeConnect) {
        const reqOrRes = await options.onBeforeConnect(req, lobby);
        if (reqOrRes instanceof Request) req = reqOrRes;
        else if (reqOrRes instanceof Response) return reqOrRes;
      }
    } else if (options?.onBeforeRequest) {
      const reqOrRes = await options.onBeforeRequest(req, lobby);
      if (reqOrRes instanceof Request) req = reqOrRes;
      else if (reqOrRes instanceof Response) return withCorsHeaders(reqOrRes);
    }
    if (options?.props !== void 0) req.headers.set("x-partykit-props", encodeProps(options.props));
    const response = await retryDurableObjectOperation(() => doNamespace.get(id, getOptions).fetch(req.clone()), {
      name,
      className
    }, options?.routingRetry);
    return isWebSocket ? response : withCorsHeaders(response);
  } else return null;
}
__name(routePartykitRequest, "routePartykitRequest");
function resolveServerOptions(serverClass) {
  let current = serverClass;
  while (current) {
    const hibernate = current.options?.hibernate;
    if (hibernate !== void 0) return { hibernate };
    current = Object.getPrototypeOf(current);
  }
  return { hibernate: false };
}
__name(resolveServerOptions, "resolveServerOptions");
var Server = class extends DurableObject {
  static {
    __name(this, "Server");
  }
  static options = { hibernate: false };
  #status = "zero";
  #ParentClass = Object.getPrototypeOf(this).constructor;
  #options = resolveServerOptions(this.#ParentClass);
  #connectionManager = this.#options.hibernate ? new HibernatingConnectionManager(this.ctx) : new InMemoryConnectionManager();
  /**
  * Execute SQL queries against the Server's database
  * @template T Type of the returned rows
  * @param strings SQL query template strings
  * @param values Values to be inserted into the query
  * @returns Array of query results
  */
  sql(strings, ...values) {
    let query = "";
    try {
      query = strings.reduce((acc, str, i) => acc + str + (i < values.length ? "?" : ""), "");
      return [...this.ctx.storage.sql.exec(query, ...values)];
    } catch (e) {
      console.error(`failed to execute sql query: ${query}`, e);
      throw this.onException(e);
    }
  }
  constructor(ctx, env2) {
    super(ctx, env2);
  }
  /**
  * Handle incoming requests to the server.
  */
  async fetch(request) {
    try {
      const props = request.headers.get("x-partykit-props");
      if (props) this.#_props = decodeProps(props);
      if (!this.ctx.id.name && !this.#_name) {
        const room = request.headers.get("x-partykit-room");
        if (room) this.#_name = room;
      }
      await this.#ensureInitialized();
      if (!this.ctx.id.name && !this.#_name) throw new Error(`Cannot determine the name for ${this.#ParentClass.name}: this.ctx.id.name is undefined, no legacy __ps_name storage record is present, and no x-partykit-room header was supplied. Likely causes:
  1. The stub was built via idFromString()/newUniqueId(). PartyServer requires name-based addressing (idFromName/getByName).
  2. The workerd/wrangler runtime is too old to expose ctx.id.name \u2014 update to a recent wrangler release.
  3. You called stub.fetch() directly without going through routePartykitRequest()/getServerByName(). Prefer those, or set the x-partykit-room header.`);
      const url = new URL(request.url);
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return await this.onRequest(request);
      else {
        const { 0: clientWebSocket, 1: serverWebSocket } = new WebSocketPair();
        let connectionId = url.searchParams.get("_pk");
        if (!connectionId) connectionId = nanoid();
        let connection = Object.assign(serverWebSocket, {
          id: connectionId,
          uri: request.url,
          server: this.name,
          tags: [],
          state: null,
          setState(setState) {
            let state;
            if (setState instanceof Function) state = setState(this.state);
            else state = setState;
            this.state = state;
            return this.state;
          }
        });
        const ctx = { request };
        const tags = await this.getConnectionTags(connection, ctx);
        connection = this.#connectionManager.accept(connection, { tags });
        if (!this.#options.hibernate) this.#attachSocketEventHandlers(connection);
        await this.onConnect(connection, ctx);
        return new Response(null, {
          status: 101,
          webSocket: clientWebSocket
        });
      }
    } catch (err) {
      console.error(`Error in ${this.#ParentClass.name}:${this.ctx.id.name ?? this.#_name ?? "<unnamed>"} fetch:`, err);
      if (!(err instanceof Error)) throw err;
      if (request.headers.get("Upgrade") === "websocket") {
        const pair = new WebSocketPair();
        pair[1].accept();
        pair[1].send(JSON.stringify({ error: err.stack }));
        pair[1].close(1011, "Uncaught exception during session setup");
        return new Response(null, {
          status: 101,
          webSocket: pair[0]
        });
      } else return new Response(err.stack, { status: 500 });
    }
  }
  async webSocketMessage(ws, message) {
    if (!isPartyServerWebSocket(ws)) return;
    try {
      const connection = createLazyConnection(ws);
      await this.#ensureInitialized();
      connection.server = this.name;
      return this.onMessage(connection, message);
    } catch (e) {
      console.error(`Error in ${this.#ParentClass.name}:${this.ctx.id.name ?? this.#_name ?? "<unnamed>"} webSocketMessage:`, e);
    }
  }
  async webSocketClose(ws, code, reason, wasClean) {
    if (!isPartyServerWebSocket(ws)) return;
    try {
      const connection = createLazyConnection(ws);
      await this.#ensureInitialized();
      connection.server = this.name;
      await this.onClose(connection, code, reason, wasClean);
    } catch (e) {
      console.error(`Error in ${this.#ParentClass.name}:${this.ctx.id.name ?? this.#_name ?? "<unnamed>"} webSocketClose:`, e);
    } finally {
      closeQuietly(ws, code, reason);
    }
  }
  async webSocketError(ws, error) {
    if (!isPartyServerWebSocket(ws)) return;
    if (isBenignTeardownError(ws, error)) return;
    try {
      const connection = createLazyConnection(ws);
      await this.#ensureInitialized();
      connection.server = this.name;
      return this.onError(connection, error);
    } catch (e) {
      console.error(`Error in ${this.#ParentClass.name}:${this.ctx.id.name ?? this.#_name ?? "<unnamed>"} webSocketError:`, e);
    }
  }
  /**
  * Read the legacy `__ps_name` storage record as a fallback source of
  * `this.name` when `ctx.id.name` is unavailable. Covers:
  *
  *   1. Alarm handlers firing on alarm records that were scheduled by
  *      a workerd version that did not yet persist `name` into the
  *      alarm record (see the Durable Objects ID docs:
  *      https://developers.cloudflare.com/durable-objects/api/id/#name).
  *      The runtime contract for current workerd populates `ctx.id.name`
  *      in alarm handlers — see the "Raw runtime contract" tests — so
  *      this fallback exists primarily for stale on-disk alarm records
  *      and for defense-in-depth against future runtime changes.
  *   2. Legacy framework-level bootstrap patterns that write
  *      `__ps_name` directly (or call `setName()`) before triggering
  *      `__unsafe_ensureInitialized()` — typically DOs addressed via
  *      `idFromString()` / `newUniqueId()` plus a name override.
  */
  async #hydrateNameFromLegacyStorage() {
    if (this.#_name) return;
    const stored = await this.ctx.storage.get(NAME_STORAGE_KEY);
    if (stored) this.#_name = stored;
  }
  async #persistNameFallbackFromCtxId() {
    const ctxName = this.ctx.id.name;
    if (ctxName === void 0 || this.#_name) return;
    if (await this.ctx.storage.get(NAME_STORAGE_KEY) !== ctxName) await this.ctx.storage.put(NAME_STORAGE_KEY, ctxName);
    this.#_name = ctxName;
  }
  /**
  * @internal — Do not use directly. This is an escape hatch for frameworks
  * (like Agents) that receive calls via native DO RPC, bypassing the
  * standard fetch/alarm/webSocket entry points where initialization
  * normally happens. Calling this from application code is unsupported
  * and may break without notice.
  */
  async __unsafe_ensureInitialized() {
    await this.#ensureInitialized();
  }
  async #ensureInitialized() {
    if (this.#status === "started") return;
    if (this.ctx.id.name !== void 0) await this.#persistNameFallbackFromCtxId();
    else if (!this.#_name) await this.#hydrateNameFromLegacyStorage();
    let error;
    await this.ctx.blockConcurrencyWhile(async () => {
      this.#status = "starting";
      try {
        await this.onStart(this.#_props);
        this.#status = "started";
      } catch (e) {
        this.#status = "zero";
        error = e;
      }
    });
    if (error) throw error;
  }
  #attachSocketEventHandlers(connection) {
    const handleMessageFromClient = /* @__PURE__ */ __name((event) => {
      this.onMessage(connection, event.data)?.catch((e) => {
        console.error("onMessage error:", e);
      });
    }, "handleMessageFromClient");
    const reciprocateClose = /* @__PURE__ */ __name((event) => {
      closeQuietly(connection, event.code, event.reason);
    }, "reciprocateClose");
    const handleCloseFromClient = /* @__PURE__ */ __name((event) => {
      connection.removeEventListener("message", handleMessageFromClient);
      connection.removeEventListener("close", handleCloseFromClient);
      let result;
      try {
        result = this.onClose(connection, event.code, event.reason, event.wasClean);
      } catch (e) {
        console.error("onClose error:", e);
        reciprocateClose(event);
        return;
      }
      if (result && typeof result.then === "function") result.catch((e) => {
        console.error("onClose error:", e);
      }).finally(() => reciprocateClose(event));
      else reciprocateClose(event);
    }, "handleCloseFromClient");
    const handleErrorFromClient = /* @__PURE__ */ __name((e) => {
      connection.removeEventListener("message", handleMessageFromClient);
      connection.removeEventListener("error", handleErrorFromClient);
      if (isBenignTeardownError(connection, e.error)) return;
      this.onError(connection, e.error)?.catch((err) => {
        console.error("onError error:", err);
      });
    }, "handleErrorFromClient");
    connection.addEventListener("close", handleCloseFromClient);
    connection.addEventListener("error", handleErrorFromClient);
    connection.addEventListener("message", handleMessageFromClient);
  }
  #_name;
  /**
  * The name for this server.
  *
  * Resolves from `this.ctx.id.name` — the native DO id name, populated
  * whenever the stub was created via `idFromName()` or `getByName()`.
  * This is available inside every entry point (including the constructor,
  * alarms, and hibernating websocket handlers).
  *
  * For alarm handlers firing on stale on-disk alarm records from
  * older workerd versions that didn't persist `name` into the alarm
  * record, the name is recovered from a storage fallback record.
  *
  * Throws if neither source is available — typically this means the DO
  * was addressed via `idFromString()` or `newUniqueId()`, which is not
  * supported by PartyServer.
  */
  get name() {
    const ctxName = this.ctx.id.name;
    if (ctxName !== void 0) return ctxName;
    if (this.#_name) return this.#_name;
    throw new Error(`Attempting to read .name on ${this.#ParentClass.name}, but this.ctx.id.name is not set and no ${NAME_STORAGE_KEY} fallback record is available. PartyServer requires DOs to be addressed via idFromName()/getByName(), or explicitly bootstrapped with setName() when using idFromString()/newUniqueId(). If this happens in an alarm handler firing on a stale alarm record, initialize the DO from a fetch/RPC entry point first so PartyServer can persist the fallback name.`);
  }
  /**
  * Establish this server's name and trigger `onStart()`.
  *
  * Use cases:
  *
  *   1. **Framework-level bootstrap of DOs where `ctx.id.name` is
  *      undefined** — e.g. DOs addressed via `idFromString()` /
  *      `newUniqueId()`. `setName()` stashes the name in memory and
  *      persists it under `__ps_name` so cold-wake invocations
  *      recover it via `#ensureInitialized()`'s legacy fallback.
  *   2. **Delivering initial `props` to `onStart()`** via the
  *      optional second argument.
  *
  * For DOs addressed via `idFromName()` / `getByName()`, calling
  * `setName()` is redundant — `this.name` is available automatically
  * from `ctx.id.name`. The normal initialization path also persists
  * a fallback record so old-compat alarm handlers can recover the name.
  * Throws if `name` does not match `ctx.id.name`.
  *
  * **Not appropriate for facets.** Cloudflare Agents and any other
  * framework using `ctx.facets.get(...)` should pass an explicit
  * `id` in `FacetStartupOptions` so the facet has its own
  * `ctx.id.name`:
  *
  * ```ts
  * const stub = ctx.facets.get(facetKey, () => ({
  *   class: ChildClass,
  *   id: ctx.exports.SomeBoundDOClass.idFromName(facetName),
  * }));
  * ```
  *
  * Without an explicit `id`, the facet inherits the parent DO's
  * `ctx.id` (including `ctx.id.name`), and `setName()` will throw
  * the ctx.id.name-mismatch error because the facet's intended
  * name differs from the parent's. See
  * https://developers.cloudflare.com/dynamic-workers/usage/durable-object-facets/
  * for the `FacetStartupOptions.id` semantics.
  *
  * @deprecated for callers that address DOs via `idFromName()` /
  * `getByName()`. Still the supported API for framework-level
  * bootstrap of header/`newUniqueId`-addressed DOs and for
  * delivering initial `props` to `onStart()`.
  */
  async setName(name, props) {
    if (!name) throw new Error("A name is required.");
    const ctxName = this.ctx.id.name;
    if (ctxName !== void 0 && ctxName !== name) throw new Error(`This server's Durable Object id was created for name "${ctxName}", cannot setName to "${name}".`);
    if (this.#_name && this.#_name !== name) throw new Error(`This server already has a name: ${this.#_name}, attempting to set to: ${name}`);
    if (props !== void 0) this.#_props = props;
    if (!this.#_name && ctxName === void 0) {
      await this.ctx.storage.put(NAME_STORAGE_KEY, name);
      this.#_name = name;
    }
    await this.#ensureInitialized();
  }
  /**
  * @internal
  * @deprecated Retained for backward compatibility with older callers.
  * `routePartykitRequest` no longer uses this method; it sends props via
  * the `x-partykit-props` header on the underlying `fetch()` request.
  */
  async _initAndFetch(name, props, request) {
    await this.setName(name, props);
    return this.fetch(request);
  }
  #sendMessageToConnection(connection, message) {
    try {
      connection.send(message);
    } catch (_e) {
      connection.close(1011, "Unexpected error");
    }
  }
  /** Send a message to all connected clients, except connection ids listed in `without` */
  broadcast(msg, without) {
    for (const connection of this.#connectionManager.getConnections()) if (!without || !without.includes(connection.id)) this.#sendMessageToConnection(connection, msg);
  }
  /** Get a connection by connection id */
  getConnection(id) {
    return this.#connectionManager.getConnection(id);
  }
  /**
  * Get all connections. Optionally, you can provide a tag to filter returned connections.
  * Use `Server#getConnectionTags` to tag the connection on connect.
  */
  getConnections(tag) {
    return this.#connectionManager.getConnections(tag);
  }
  /**
  * You can tag a connection to filter them in Server#getConnections.
  * Each connection supports up to 9 tags, each tag max length is 256 characters.
  */
  getConnectionTags(connection, context) {
    return [];
  }
  #_props;
  /**
  * Called when the server is started for the first time.
  */
  onStart(props) {
  }
  /**
  * Called when a new connection is made to the server.
  */
  onConnect(connection, ctx) {
  }
  /**
  * Called when a message is received from a connection.
  */
  onMessage(connection, message) {
  }
  /**
  * Called when a connection is closed.
  */
  onClose(connection, code, reason, wasClean) {
  }
  /**
  * Called when an error occurs on a connection.
  */
  onError(connection, error) {
    console.error(`Error on connection ${connection.id} in ${this.#ParentClass.name}:${this.name}:`, error);
    console.info(`Implement onError on ${this.#ParentClass.name} to handle this error.`);
  }
  /**
  * Called when a request is made to the server.
  */
  onRequest(request) {
    console.warn(`onRequest hasn't been implemented on ${this.#ParentClass.name}:${this.name} responding to ${request.url}`);
    return new Response("Not implemented", { status: 404 });
  }
  /**
  * Called when an exception occurs.
  * @param error - The error that occurred.
  */
  onException(error) {
    console.error(`Exception in ${this.#ParentClass.name}:${this.name}:`, error);
    console.info(`Implement onException on ${this.#ParentClass.name} to handle this error.`);
  }
  onAlarm() {
    console.log(`Implement onAlarm on ${this.#ParentClass.name} to handle alarms.`);
  }
  async alarm() {
    await this.#ensureInitialized();
    await this.onAlarm();
  }
};

// ../packages/game-logic/src/config.ts
var DEFAULT_CONFIG = {
  startingCash: 15e3,
  passGoBonus: 0,
  freeParkingJackpot: false,
  auctionOnDecline: true,
  rollTwelveToStart: false,
  maxJailTurns: 3,
  jailFine: 1e3,
  doublesJailAfter: 3,
  turnTimerSeconds: 60,
  incomeTaxChoice: true,
  clubHouseFee: 100,
  restHouseSkipsFullTurn: true
};

// ../packages/game-logic/src/board.ts
var BOARD = [
  // ── Bottom row (0-9) ──
  { index: 0, name: "GO", type: "corner", cornerType: "go" },
  { index: 1, name: "Salvador", type: "property", group: "A", price: 600 },
  { index: 2, name: "Community Chest", type: "card", deck: "communityChest" },
  { index: 3, name: "Rio de Janeiro", type: "property", group: "A", price: 600 },
  { index: 4, name: "Income Tax", type: "tax", taxAmount: 200, taxPercentOption: true },
  { index: 5, name: "JFK Airport", type: "railway", price: 2e3 },
  { index: 6, name: "Paris", type: "property", group: "B", price: 1e3 },
  { index: 7, name: "Chance", type: "card", deck: "chance" },
  { index: 8, name: "Lyon", type: "property", group: "B", price: 1e3 },
  { index: 9, name: "Toulouse", type: "property", group: "B", price: 1e3 },
  // ── Left column (10-19) ──
  { index: 10, name: "Jail / Just Visiting", type: "corner", cornerType: "jail" },
  { index: 11, name: "Shanghai", type: "property", group: "C", price: 1400 },
  { index: 12, name: "Power Co.", type: "utility", price: 1500 },
  { index: 13, name: "Beijing", type: "property", group: "C", price: 1400 },
  { index: 14, name: "Shenzhen", type: "property", group: "C", price: 1400 },
  { index: 15, name: "CDG Airport", type: "railway", price: 2e3 },
  { index: 16, name: "Tokyo", type: "property", group: "D", price: 1800 },
  { index: 17, name: "Club House", type: "fee", fee: 100 },
  { index: 18, name: "Osaka", type: "property", group: "D", price: 1800 },
  { index: 19, name: "Kyoto", type: "property", group: "D", price: 1800 },
  // ── Top row (20-29) ──
  { index: 20, name: "Free Parking", type: "corner", cornerType: "freeParking" },
  { index: 21, name: "Rome", type: "property", group: "E", price: 2200 },
  { index: 22, name: "Chance", type: "card", deck: "chance" },
  { index: 23, name: "Milan", type: "property", group: "E", price: 2200 },
  { index: 24, name: "Venice", type: "property", group: "E", price: 2200 },
  { index: 25, name: "Heathrow Airport", type: "railway", price: 2e3 },
  { index: 26, name: "Berlin", type: "property", group: "F", price: 2600 },
  { index: 27, name: "Munich", type: "property", group: "F", price: 2600 },
  { index: 28, name: "Water Board", type: "utility", price: 1500 },
  { index: 29, name: "Frankfurt", type: "property", group: "F", price: 2600 },
  // ── Right column (30-39) ──
  { index: 30, name: "Go To Jail", type: "corner", cornerType: "goToJail" },
  { index: 31, name: "London", type: "property", group: "G", price: 3e3 },
  { index: 32, name: "Manchester", type: "property", group: "G", price: 3e3 },
  { index: 33, name: "Rest House", type: "skip" },
  { index: 34, name: "Liverpool", type: "property", group: "G", price: 3e3 },
  { index: 35, name: "Narita Airport", type: "railway", price: 2e3 },
  { index: 36, name: "Surprise", type: "card", deck: "surprise" },
  { index: 37, name: "Wealth Tax", type: "tax", taxAmount: 1500 },
  { index: 38, name: "New York", type: "property", group: "H", price: 3800 },
  { index: 39, name: "San Francisco", type: "property", group: "H", price: 3800 }
];
var RAILWAY_INDICES = [5, 15, 25, 35];
var UTILITY_INDICES = [12, 28];
var BASE_RENT = {
  A: 40,
  B: 70,
  C: 100,
  D: 140,
  E: 180,
  F: 220,
  G: 260,
  H: 350
};
var RENT_MULTIPLIERS = [1, 5, 15, 45, 80, 125];
var RAILWAY_RENT = [0, 250, 500, 1e3, 2e3];
var UTILITY_MULTIPLIER = [0, 4, 10];
function getGroupTiles(group) {
  return BOARD.filter((t) => t.group === group).map((t) => t.index);
}
__name(getGroupTiles, "getGroupTiles");
function getOwnableTileIndices() {
  return BOARD.filter((t) => t.type === "property" || t.type === "railway" || t.type === "utility").map((t) => t.index);
}
__name(getOwnableTileIndices, "getOwnableTileIndices");
function getHouseCost(price) {
  return Math.round(price / 2 / 50) * 50;
}
__name(getHouseCost, "getHouseCost");

// ../packages/game-logic/src/dice.ts
function rollDice(die1 = Math.ceil(Math.random() * 6), die2 = Math.ceil(Math.random() * 6)) {
  return {
    die1,
    die2,
    total: die1 + die2,
    isDoubles: die1 === die2
  };
}
__name(rollDice, "rollDice");
function movePosition(currentPosition, steps, boardSize = 40) {
  const newPosition = (currentPosition + steps) % boardSize;
  const passedGo = currentPosition + steps >= boardSize;
  return { newPosition, passedGo };
}
__name(movePosition, "movePosition");
function moveBackward(currentPosition, spaces, boardSize = 40) {
  return ((currentPosition - spaces) % boardSize + boardSize) % boardSize;
}
__name(moveBackward, "moveBackward");

// ../packages/game-logic/src/rent.ts
function ownsFullGroup(playerId, group, properties) {
  const tiles = getGroupTiles(group);
  return tiles.every((idx) => properties[idx]?.ownerId === playerId);
}
__name(ownsFullGroup, "ownsFullGroup");
function countOwnedRailways(playerId, properties) {
  return RAILWAY_INDICES.filter((idx) => properties[idx]?.ownerId === playerId).length;
}
__name(countOwnedRailways, "countOwnedRailways");
function countOwnedUtilities(playerId, properties) {
  return UTILITY_INDICES.filter((idx) => properties[idx]?.ownerId === playerId).length;
}
__name(countOwnedUtilities, "countOwnedUtilities");
function calculatePropertyRent(tileIndex, properties) {
  const prop = properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;
  const tile = BOARD[tileIndex];
  if (tile.type !== "property" || !tile.group) return 0;
  const baseRent = BASE_RENT[tile.group];
  if (prop.houses > 0) {
    return baseRent * RENT_MULTIPLIERS[prop.houses];
  }
  if (ownsFullGroup(prop.ownerId, tile.group, properties)) {
    return baseRent * 2;
  }
  return baseRent;
}
__name(calculatePropertyRent, "calculatePropertyRent");
function calculateRailwayRent(tileIndex, properties) {
  const prop = properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;
  const count = countOwnedRailways(prop.ownerId, properties);
  return RAILWAY_RENT[count] ?? 0;
}
__name(calculateRailwayRent, "calculateRailwayRent");
function calculateUtilityRent(tileIndex, properties, diceRoll) {
  const prop = properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;
  const count = countOwnedUtilities(prop.ownerId, properties);
  return diceRoll.total * (UTILITY_MULTIPLIER[count] ?? 0);
}
__name(calculateUtilityRent, "calculateUtilityRent");
function calculateRent(tileIndex, landingPlayerId, state) {
  const prop = state.properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return null;
  if (prop.ownerId === landingPlayerId) return null;
  const tile = BOARD[tileIndex];
  let amount = 0;
  switch (tile.type) {
    case "property":
      amount = calculatePropertyRent(tileIndex, state.properties);
      break;
    case "railway":
      amount = calculateRailwayRent(tileIndex, state.properties);
      break;
    case "utility":
      amount = calculateUtilityRent(tileIndex, state.properties, state.dice);
      break;
    default:
      return null;
  }
  if (amount <= 0) return null;
  const owner = state.players.find((p) => p.id === prop.ownerId);
  if (owner && owner.rentCollectionMultiplier !== 1) {
    amount = Math.floor(amount * owner.rentCollectionMultiplier);
  }
  const landingPlayer = state.players.find((p) => p.id === landingPlayerId);
  if (landingPlayer?.rentFreePass) {
    return null;
  }
  return { amount, ownerId: prop.ownerId };
}
__name(calculateRent, "calculateRent");

// ../packages/game-logic/src/property.ts
function initializeProperties() {
  const properties = {};
  for (const idx of getOwnableTileIndices()) {
    properties[idx] = { ownerId: null, mortgaged: false, houses: 0 };
  }
  return properties;
}
__name(initializeProperties, "initializeProperties");
function canBuyProperty(playerId, tileIndex, state) {
  const tile = BOARD[tileIndex];
  if (!tile.price) return false;
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== null) return false;
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.bankrupt) return false;
  return player.cash >= tile.price;
}
__name(canBuyProperty, "canBuyProperty");
function canBuildHouse(playerId, tileIndex, state) {
  const tile = BOARD[tileIndex];
  if (tile.type !== "property" || !tile.group || !tile.price) return false;
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId || prop.mortgaged) return false;
  if (prop.houses >= 5) return false;
  if (!ownsFullGroup(playerId, tile.group, state.properties)) return false;
  const groupTiles = getGroupTiles(tile.group);
  if (groupTiles.some((idx) => state.properties[idx]?.mortgaged)) return false;
  const minHouses = Math.min(...groupTiles.map((idx) => state.properties[idx]?.houses ?? 0));
  if (prop.houses > minHouses) return false;
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;
  const cost = prop.houses === 4 ? tile.price : getHouseCost(tile.price);
  return player.cash >= cost;
}
__name(canBuildHouse, "canBuildHouse");
function getBuildCost(tileIndex, currentHouses) {
  const tile = BOARD[tileIndex];
  if (!tile.price) return 0;
  if (currentHouses === 4) {
    return tile.price;
  }
  return getHouseCost(tile.price);
}
__name(getBuildCost, "getBuildCost");
function canSellHouse(playerId, tileIndex, state) {
  const tile = BOARD[tileIndex];
  if (tile.type !== "property" || !tile.group) return false;
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId) return false;
  if (prop.houses <= 0) return false;
  const groupTiles = getGroupTiles(tile.group);
  const maxHouses = Math.max(...groupTiles.map((idx) => state.properties[idx]?.houses ?? 0));
  if (prop.houses < maxHouses) return false;
  return true;
}
__name(canSellHouse, "canSellHouse");
function getHouseSellPrice(tileIndex, currentHouses) {
  return Math.floor(getBuildCost(tileIndex, currentHouses === 5 ? 4 : currentHouses - 1) / 2);
}
__name(getHouseSellPrice, "getHouseSellPrice");
function canMortgage(playerId, tileIndex, state) {
  const tile = BOARD[tileIndex];
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId || prop.mortgaged) return false;
  if (prop.houses > 0) return false;
  if (tile.group) {
    const groupTiles = getGroupTiles(tile.group);
    if (groupTiles.some((idx) => (state.properties[idx]?.houses ?? 0) > 0)) return false;
  }
  return true;
}
__name(canMortgage, "canMortgage");
function getMortgageValue(tileIndex) {
  const tile = BOARD[tileIndex];
  return tile.price ? Math.floor(tile.price / 2) : 0;
}
__name(getMortgageValue, "getMortgageValue");
function getUnmortgageCost(tileIndex) {
  const value = getMortgageValue(tileIndex);
  return Math.ceil(value * 1.1);
}
__name(getUnmortgageCost, "getUnmortgageCost");
function canUnmortgage(playerId, tileIndex, state) {
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId || !prop.mortgaged) return false;
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;
  return player.cash >= getUnmortgageCost(tileIndex);
}
__name(canUnmortgage, "canUnmortgage");

// ../packages/game-logic/src/jail.ts
function canPayJailFine(player, config) {
  return player.inJail && player.cash >= config.jailFine;
}
__name(canPayJailFine, "canPayJailFine");
function canUseJailCard(player) {
  return player.inJail && player.getOutOfJailFreeCards > 0;
}
__name(canUseJailCard, "canUseJailCard");
function isJailFineForced(player, config) {
  return player.inJail && player.jailTurns >= config.maxJailTurns;
}
__name(isJailFineForced, "isJailFineForced");
function sendToJail(player) {
  return {
    ...player,
    position: 10,
    // Jail tile
    inJail: true,
    jailTurns: 0
  };
}
__name(sendToJail, "sendToJail");
function releaseFromJail(player) {
  return {
    ...player,
    inJail: false,
    jailTurns: 0
  };
}
__name(releaseFromJail, "releaseFromJail");
function incrementJailTurn(player) {
  return {
    ...player,
    jailTurns: player.jailTurns + 1
  };
}
__name(incrementJailTurn, "incrementJailTurn");

// ../packages/game-logic/src/tax.ts
function calculateNetWorth(playerId, state) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return 0;
  let netWorth = player.cash;
  for (const [tileIdxStr, prop] of Object.entries(state.properties)) {
    if (prop.ownerId !== playerId) continue;
    const tileIdx = Number(tileIdxStr);
    const tile = BOARD[tileIdx];
    if (!tile.price) continue;
    if (prop.mortgaged) {
      netWorth += Math.floor(tile.price / 2);
    } else {
      netWorth += tile.price;
      if (tile.type === "property" && prop.houses > 0) {
        const houseCost = Math.round(tile.price / 2 / 50) * 50;
        if (prop.houses <= 4) {
          netWorth += houseCost * prop.houses;
        } else {
          netWorth += houseCost * 4 + tile.price;
        }
      }
    }
  }
  return netWorth;
}
__name(calculateNetWorth, "calculateNetWorth");
function calculateIncomeTax(playerId, choice, state) {
  const tile = BOARD[4];
  const flatAmount = tile.taxAmount ?? 200;
  if (choice === "flat" || !state.config.incomeTaxChoice) {
    return flatAmount;
  }
  const netWorth = calculateNetWorth(playerId, state);
  return Math.floor(netWorth * 0.1);
}
__name(calculateIncomeTax, "calculateIncomeTax");
function calculateWealthTax() {
  return BOARD[37].taxAmount ?? 1500;
}
__name(calculateWealthTax, "calculateWealthTax");
function resolveTax(tileIndex, playerId, choice, state) {
  if (tileIndex === 4) {
    return calculateIncomeTax(playerId, choice, state);
  }
  if (tileIndex === 37) {
    return calculateWealthTax();
  }
  return 0;
}
__name(resolveTax, "resolveTax");

// ../packages/game-logic/src/cards.ts
var CHANCE_CARDS = [
  {
    id: "ch-01",
    deck: "chance",
    text: "Advance to GO.",
    effect: { type: "advanceToGo", tileIndex: 0 }
  },
  {
    id: "ch-02",
    deck: "chance",
    text: "Advance to San Francisco. If you pass GO, collect nothing (no GO bonus).",
    effect: { type: "moveTo", tileIndex: 39 }
  },
  {
    id: "ch-03",
    deck: "chance",
    text: "Advance to London.",
    effect: { type: "moveTo", tileIndex: 31 }
  },
  {
    id: "ch-04",
    deck: "chance",
    text: "Advance to JFK Airport.",
    effect: { type: "moveTo", tileIndex: 5 }
  },
  {
    id: "ch-05",
    deck: "chance",
    text: "Advance to the nearest Airport. Pay the owner double rent if owned.",
    effect: { type: "moveToNearest", nearestType: "railway", payDoubleRent: true }
  },
  {
    id: "ch-06",
    deck: "chance",
    text: "Advance to the nearest Airport. Pay the owner double rent if owned.",
    effect: { type: "moveToNearest", nearestType: "railway", payDoubleRent: true }
  },
  {
    id: "ch-07",
    deck: "chance",
    text: "Advance to the nearest Utility. If owned, pay 10\xD7 your dice roll.",
    effect: { type: "moveToNearest", nearestType: "utility", payTenTimesDice: true }
  },
  {
    id: "ch-08",
    deck: "chance",
    text: "Go back 3 spaces.",
    effect: { type: "moveBack", spaces: 3 }
  },
  {
    id: "ch-09",
    deck: "chance",
    text: "Go directly to Jail. Do not pass GO.",
    effect: { type: "goToJail" }
  },
  {
    id: "ch-10",
    deck: "chance",
    text: "Bank pays you a dividend of $500.",
    effect: { type: "collectFromBank", amount: 500 }
  },
  {
    id: "ch-11",
    deck: "chance",
    text: "Your investments mature. Collect $1,500.",
    effect: { type: "collectFromBank", amount: 1500 }
  },
  {
    id: "ch-12",
    deck: "chance",
    text: "Pay hospital bill: $1,000.",
    effect: { type: "payToBank", amount: 1e3 }
  },
  {
    id: "ch-13",
    deck: "chance",
    text: "Pay school fees: $500.",
    effect: { type: "payToBank", amount: 500 }
  },
  {
    id: "ch-14",
    deck: "chance",
    text: "Speeding fine: pay $150.",
    effect: { type: "payToBank", amount: 150 }
  },
  {
    id: "ch-15",
    deck: "chance",
    text: "Rent-free pass! Your next rent payment is waived.",
    effect: { type: "rentFreePass" }
  },
  {
    id: "ch-16",
    deck: "chance",
    text: "Get Out of Jail Free. Keep this card until needed.",
    effect: { type: "getOutOfJailFree" }
  }
];
var COMMUNITY_CHEST_CARDS = [
  {
    id: "cc-01",
    deck: "communityChest",
    text: "Advance to GO.",
    effect: { type: "advanceToGo", tileIndex: 0 }
  },
  {
    id: "cc-02",
    deck: "communityChest",
    text: "Bank error in your favour. Collect $2,000.",
    effect: { type: "collectFromBank", amount: 2e3 }
  },
  {
    id: "cc-03",
    deck: "communityChest",
    text: "Doctor's fee. Pay $500.",
    effect: { type: "payToBank", amount: 500 }
  },
  {
    id: "cc-04",
    deck: "communityChest",
    text: "Sale of stock. Receive $500.",
    effect: { type: "collectFromBank", amount: 500 }
  },
  {
    id: "cc-05",
    deck: "communityChest",
    text: "Insurance premium. Pay $500.",
    effect: { type: "payToBank", amount: 500 }
  },
  {
    id: "cc-06",
    deck: "communityChest",
    text: "Income tax refund. Collect $200.",
    effect: { type: "collectFromBank", amount: 200 }
  },
  {
    id: "cc-07",
    deck: "communityChest",
    text: "It's your birthday! Collect $100 from every player.",
    effect: { type: "collectFromAll", amount: 100 }
  },
  {
    id: "cc-08",
    deck: "communityChest",
    text: "Inherit $1,000.",
    effect: { type: "collectFromBank", amount: 1e3 }
  },
  {
    id: "cc-09",
    deck: "communityChest",
    text: "Pay hospital bill: $1,000.",
    effect: { type: "payToBank", amount: 1e3 }
  },
  {
    id: "cc-10",
    deck: "communityChest",
    text: "Receive consultancy fee: $250.",
    effect: { type: "collectFromBank", amount: 250 }
  },
  {
    id: "cc-11",
    deck: "communityChest",
    text: "Street repairs! Pay $400 per house and $1,150 per hotel.",
    effect: { type: "payPerHouseHotel", perHouse: 400, perHotel: 1150 }
  },
  {
    id: "cc-12",
    deck: "communityChest",
    text: "Won second prize in a beauty contest. Collect $100.",
    effect: { type: "collectFromBank", amount: 100 }
  },
  {
    id: "cc-13",
    deck: "communityChest",
    text: "Holiday fund matures. Collect $1,000.",
    effect: { type: "collectFromBank", amount: 1e3 }
  },
  {
    id: "cc-14",
    deck: "communityChest",
    text: "Go directly to Jail. Do not pass GO.",
    effect: { type: "goToJail" }
  },
  {
    id: "cc-15",
    deck: "communityChest",
    text: "Get Out of Jail Free. Keep this card until needed.",
    effect: { type: "getOutOfJailFree" }
  },
  {
    id: "cc-16",
    deck: "communityChest",
    text: "Property repairs! Pay $250 per house and $800 per hotel.",
    effect: { type: "payPerHouseHotel", perHouse: 250, perHotel: 800 }
  }
];
var SURPRISE_CARDS = [
  {
    id: "su-01",
    deck: "surprise",
    text: "Swap positions with a random player!",
    effect: { type: "swapPosition" }
  },
  {
    id: "su-02",
    deck: "surprise",
    text: "Swap positions with a random player!",
    effect: { type: "swapPosition" }
  },
  {
    id: "su-03",
    deck: "surprise",
    text: "Double trouble! Rent collected on your properties is doubled this round.",
    effect: { type: "doubleRent" }
  },
  {
    id: "su-04",
    deck: "surprise",
    text: "Double trouble! Rent collected on your properties is doubled this round.",
    effect: { type: "doubleRent" }
  },
  {
    id: "su-05",
    deck: "surprise",
    text: "Time freeze! Skip every other player's next turn.",
    effect: { type: "skipOthersTurn" }
  },
  {
    id: "su-06",
    deck: "surprise",
    text: "Mandatory auction! The property you're standing on goes to auction.",
    effect: { type: "forceAuction" }
  },
  {
    id: "su-07",
    deck: "surprise",
    text: "Mandatory auction! The property you're standing on goes to auction.",
    effect: { type: "forceAuction" }
  },
  {
    id: "su-08",
    deck: "surprise",
    text: "All players pay you $200 as tribute.",
    effect: { type: "collectFromAll", amount: 200 }
  },
  {
    id: "su-09",
    deck: "surprise",
    text: "Tax rebate! Collect $800 from the bank.",
    effect: { type: "collectFromBank", amount: 800 }
  },
  {
    id: "su-10",
    deck: "surprise",
    text: "Market crash! Pay $600 to the bank.",
    effect: { type: "payToBank", amount: 600 }
  },
  {
    id: "su-11",
    deck: "surprise",
    text: "Lucky break! Collect $1,200 from the bank.",
    effect: { type: "collectFromBank", amount: 1200 }
  },
  {
    id: "su-12",
    deck: "surprise",
    text: "Advance to Kyoto.",
    effect: { type: "moveTo", tileIndex: 19 }
  },
  {
    id: "su-13",
    deck: "surprise",
    text: "Advance to Tokyo.",
    effect: { type: "moveTo", tileIndex: 16 }
  },
  {
    id: "su-14",
    deck: "surprise",
    text: "Go directly to Jail. Do not pass GO.",
    effect: { type: "goToJail" }
  },
  {
    id: "su-15",
    deck: "surprise",
    text: "Get Out of Jail Free. Keep this card until needed.",
    effect: { type: "getOutOfJailFree" }
  },
  {
    id: "su-16",
    deck: "surprise",
    text: "Get Out of Jail Free. Keep this card until needed.",
    effect: { type: "getOutOfJailFree" }
  }
];
var ALL_CARDS_MAP = /* @__PURE__ */ new Map();
for (const card of [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS, ...SURPRISE_CARDS]) {
  ALL_CARDS_MAP.set(card.id, card);
}
function getCardById(id) {
  return ALL_CARDS_MAP.get(id);
}
__name(getCardById, "getCardById");
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
__name(shuffleDeck, "shuffleDeck");
function createShuffledDecks() {
  return {
    chance: shuffleDeck(CHANCE_CARDS.map((c) => c.id)),
    communityChest: shuffleDeck(COMMUNITY_CHEST_CARDS.map((c) => c.id)),
    surprise: shuffleDeck(SURPRISE_CARDS.map((c) => c.id))
  };
}
__name(createShuffledDecks, "createShuffledDecks");
function drawCard(deckIds) {
  if (deckIds.length === 0) return null;
  const [topId, ...rest] = deckIds;
  const card = getCardById(topId);
  if (!card) return null;
  const remainingDeck = card.effect.type === "getOutOfJailFree" ? rest : [...rest, topId];
  return { card, remainingDeck };
}
__name(drawCard, "drawCard");
function findNearestTile(position, tileType, boardSize = 40) {
  const indices = tileType === "railway" ? [5, 15, 25, 35] : [12, 28];
  for (let i = 1; i <= boardSize; i++) {
    const checkIdx = (position + i) % boardSize;
    if (indices.includes(checkIdx)) return checkIdx;
  }
  return indices[0];
}
__name(findNearestTile, "findNearestTile");

// ../packages/game-logic/src/player.ts
function canAfford(player, amount) {
  return player.cash >= amount;
}
__name(canAfford, "canAfford");
function createPlayer(id, name, startingCash, gotiId) {
  return {
    id,
    name,
    gotiId,
    cash: startingCash,
    position: 0,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeCards: 0,
    bankrupt: false,
    skipNextTurn: false,
    rentFreePass: false,
    rentCollectionMultiplier: 1
  };
}
__name(createPlayer, "createPlayer");
function getActivePlayers(players) {
  return players.filter((p) => !p.bankrupt);
}
__name(getActivePlayers, "getActivePlayers");
function isGameOver(players) {
  return getActivePlayers(players).length <= 1;
}
__name(isGameOver, "isGameOver");
function getWinner(players) {
  const active = getActivePlayers(players);
  return active.length === 1 ? active[0] : null;
}
__name(getWinner, "getWinner");

// src/server.ts
var VyaparServer = class extends Server {
  static {
    __name(this, "VyaparServer");
  }
  static options = {
    hibernate: false
  };
  state;
  auctionTimer = null;
  clearAuctionTimer() {
    if (this.auctionTimer) {
      clearTimeout(this.auctionTimer);
      this.auctionTimer = null;
    }
  }
  resetAuctionTimer(timeoutMs = 12e3) {
    this.clearAuctionTimer();
    if (this.state.phase !== "auction" || !this.state.auction) return;
    this.auctionTimer = setTimeout(() => {
      try {
        if (this.state.phase === "auction" && this.state.auction) {
          const auction = this.state.auction;
          const currentBidderId = auction.activeParticipants[auction.currentBidderTurnIndex];
          if (currentBidderId) {
            this.handlePassAuction(currentBidderId);
            this.broadcastState();
          }
        }
      } catch (err) {
        console.error("Error in auction timeout handler:", err);
      }
    }, timeoutMs);
  }
  onStart() {
    this.state = this.createWaitingState(this.name);
  }
  // ── Lifecycle ────────────────────────────────────────────────
  onConnect(conn, ctx) {
    if (!this.state) {
      this.state = this.createWaitingState(this.name);
    }
    const playerId = conn.id;
    const existingPlayer = this.state.players.find((p) => p.id === playerId);
    if (!existingPlayer && this.state.phase !== "waiting") {
      this.sendTo(conn, {
        type: "error",
        message: "Game already in progress. Cannot join as a new player."
      });
      conn.close(4001, "Game in progress");
      return;
    }
    if (!existingPlayer && this.state.phase === "waiting") {
      if (this.state.players.length >= 8) {
        this.sendTo(conn, {
          type: "error",
          message: "Room is full (max 8 players)."
        });
        conn.close(4003, "Room full");
        return;
      }
      if (!this.state.hostId || this.state.players.length === 0) {
        this.state.hostId = playerId;
      }
      const player = createPlayer(
        playerId,
        `Player ${this.state.players.length + 1}`,
        this.state.config.startingCash
      );
      this.state.players.push(player);
      this.addLog(`${player.name} joined the room.`);
    }
    this.sendTo(conn, {
      type: "roomInfo",
      roomId: this.name,
      playerId
    });
    this.broadcastState();
  }
  onClose(conn) {
    const playerId = conn.id;
    if (playerId && this.state && this.state.phase === "waiting") {
      const hasOtherConn = Array.from(this.getConnections()).some((c) => c.id === playerId && c !== conn);
      if (!hasOtherConn) {
        this.state.players = this.state.players.filter((p) => p.id !== playerId);
        if (this.state.hostId === playerId) {
          this.state.hostId = this.state.players[0]?.id;
        }
        this.addLog(`A player left the room.`);
        this.broadcastState();
      }
    }
  }
  onMessage(sender, message) {
    let intent;
    try {
      const text = typeof message === "string" ? message : new TextDecoder().decode(message);
      intent = JSON.parse(text);
    } catch {
      this.sendTo(sender, { type: "error", message: "Invalid message format." });
      return;
    }
    const playerId = sender.id;
    try {
      this.handleIntent(playerId, intent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      this.sendTo(sender, { type: "error", message: msg });
    }
  }
  // ── Intent Handler ───────────────────────────────────────────
  handleIntent(playerId, intent) {
    switch (intent.type) {
      case "setName":
        this.handleSetName(playerId, intent.name);
        break;
      case "setGoti":
        this.handleSetGoti(playerId, intent.gotiId);
        break;
      case "updateConfig":
        this.handleUpdateConfig(playerId, intent.config);
        break;
      case "startGame":
        this.handleStartGame(playerId);
        break;
      case "resetGame":
        this.handleResetGame(playerId);
        break;
      case "rollDice":
        this.handleRollDice(playerId);
        break;
      case "buyProperty":
        this.handleBuyProperty(playerId);
        break;
      case "declineBuy":
        this.handleDeclineBuy(playerId);
        break;
      case "placeBid":
        this.handlePlaceBid(playerId, intent.amount);
        break;
      case "passAuction":
        this.handlePassAuction(playerId);
        break;
      case "buildHouse":
        this.handleBuildHouse(playerId, intent.tileIndex);
        break;
      case "sellHouse":
        this.handleSellHouse(playerId, intent.tileIndex);
        break;
      case "mortgage":
        this.handleMortgage(playerId, intent.tileIndex);
        break;
      case "unmortgage":
        this.handleUnmortgage(playerId, intent.tileIndex);
        break;
      case "payJailFine":
        this.handlePayJailFine(playerId);
        break;
      case "useGetOutOfJailCard":
        this.handleUseJailCard(playerId);
        break;
      case "rollForJail":
        this.handleRollForJail(playerId);
        break;
      case "payTaxFlat":
        this.handlePayTax(playerId, "flat");
        break;
      case "payTaxPercent":
        this.handlePayTax(playerId, "percent");
        break;
      case "endTurn":
        this.handleEndTurn(playerId);
        break;
      default:
        throw new Error(`Unhandled intent: ${intent.type}`);
    }
    this.broadcastState();
  }
  // ── Lobby ────────────────────────────────────────────────────
  handleSetName(playerId, name) {
    const player = this.getPlayer(playerId);
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) throw new Error("Name cannot be empty.");
    const nameTaken = this.state.players.some(
      (p) => p.id !== playerId && p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (nameTaken) {
      throw new Error(`The name "${trimmed}" is already taken in this room. Please choose a different name.`);
    }
    player.name = trimmed;
    this.addLog(`${player.name} updated their name.`);
  }
  handleSetGoti(playerId, gotiId) {
    const player = this.getPlayer(playerId);
    player.gotiId = gotiId;
  }
  handleResetGame(playerId) {
    this.clearAuctionTimer();
    const roomPlayers = this.state.players.map((p) => ({
      ...p,
      cash: this.state.config.startingCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0,
      bankrupt: false,
      skipNextTurn: false,
      rentFreePass: false,
      rentCollectionMultiplier: 1
    }));
    this.state = this.createWaitingState(this.name);
    this.state.players = roomPlayers;
    this.addLog("Game reset to lobby.");
  }
  handleMortgage(playerId, tileIndex) {
    if (this.state.phase === "waiting" || this.state.phase === "gameOver") {
      throw new Error("Cannot mortgage right now.");
    }
    const player = this.getPlayer(playerId);
    if (!canMortgage(playerId, tileIndex, this.state)) {
      throw new Error("Cannot mortgage this property.");
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const val = getMortgageValue(tileIndex);
    prop.mortgaged = true;
    player.cash += val;
    this.addLog(`${player.name} mortgaged ${tile.name} for \u20B9${val}.`);
  }
  handleUnmortgage(playerId, tileIndex) {
    if (this.state.phase === "waiting" || this.state.phase === "gameOver") {
      throw new Error("Cannot unmortgage right now.");
    }
    const player = this.getPlayer(playerId);
    if (!canUnmortgage(playerId, tileIndex, this.state)) {
      throw new Error("Cannot unmortgage this property.");
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const cost = getUnmortgageCost(tileIndex);
    player.cash -= cost;
    prop.mortgaged = false;
    this.addLog(`${player.name} lifted mortgage on ${tile.name} for \u20B9${cost}.`);
  }
  handleBuildHouse(playerId, tileIndex) {
    if (this.state.phase === "waiting" || this.state.phase === "gameOver") {
      throw new Error("Cannot build right now.");
    }
    const player = this.getPlayer(playerId);
    if (!canBuildHouse(playerId, tileIndex, this.state)) {
      throw new Error("Cannot build on this property.");
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const cost = getBuildCost(tileIndex, prop.houses);
    player.cash -= cost;
    prop.houses += 1;
    const upgradeType = prop.houses === 5 ? "a Hotel \u{1F3E8}" : `House #${prop.houses} \u{1F3E0}`;
    this.addLog(`${player.name} built ${upgradeType} on ${tile.name} for \u20B9${cost}.`);
  }
  handleSellHouse(playerId, tileIndex) {
    if (this.state.phase === "waiting" || this.state.phase === "gameOver") {
      throw new Error("Cannot sell houses right now.");
    }
    const player = this.getPlayer(playerId);
    if (!canSellHouse(playerId, tileIndex, this.state)) {
      throw new Error("Cannot sell house from this property.");
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const refund = getHouseSellPrice(tileIndex, prop.houses);
    prop.houses -= 1;
    player.cash += refund;
    this.addLog(`${player.name} sold a house from ${tile.name} for \u20B9${refund}.`);
  }
  handleUpdateConfig(playerId, config) {
    if (this.state.phase !== "waiting") throw new Error("Cannot change config during game.");
    const hostId = this.state.hostId || this.state.players[0]?.id;
    if (hostId !== playerId) throw new Error("Only the host can change settings.");
    this.state.config = { ...this.state.config, ...config };
    this.addLog("Game settings updated.");
  }
  handleStartGame(playerId) {
    if (this.state.phase !== "waiting") throw new Error("Game already started.");
    const hostId = this.state.hostId || this.state.players[0]?.id;
    if (hostId !== playerId) throw new Error("Only the host can start the game.");
    if (this.state.players.length < 2) throw new Error("Need at least 2 players.");
    const rolls = this.state.players.map((p) => ({
      id: p.id,
      roll: Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)
    }));
    rolls.sort((a, b) => b.roll - a.roll);
    this.state.turnOrder = rolls.map((r) => r.id);
    const playerMap = new Map(this.state.players.map((p) => [p.id, p]));
    this.state.players = this.state.turnOrder.map((id) => playerMap.get(id));
    this.state.properties = initializeProperties();
    this.state.decks = createShuffledDecks();
    this.state.currentPlayerIndex = 0;
    this.state.phase = "rolling";
    this.state.doublesCount = 0;
    this.addLog(`Game started! ${this.state.players[0].name} goes first.`);
  }
  // ── Rolling & Movement ───────────────────────────────────────
  handleRollDice(playerId) {
    this.assertCurrentPlayer(playerId);
    this.assertPhase("rolling");
    const player = this.getCurrentPlayer();
    const dice = rollDice();
    this.state.dice = dice;
    this.addLog(`${player.name} rolled ${dice.die1} + ${dice.die2} = ${dice.total}.`);
    if (dice.isDoubles) {
      this.state.doublesCount += 1;
      if (this.state.doublesCount >= this.state.config.doublesJailAfter) {
        this.addLog(`${player.name} rolled doubles ${this.state.doublesCount} times \u2014 go to Jail!`);
        this.goToJail(player);
        this.state.phase = "rolling";
        this.advanceTurn();
        return;
      }
    } else {
      this.state.doublesCount = 0;
    }
    const { newPosition, passedGo } = movePosition(player.position, dice.total);
    player.position = newPosition;
    if (passedGo && this.state.config.passGoBonus > 0) {
      player.cash += this.state.config.passGoBonus;
      this.addLog(`${player.name} passed GO and collected \u20B9${this.state.config.passGoBonus}.`);
    }
    this.addLog(`${player.name} landed on ${BOARD[newPosition].name}.`);
    this.resolveTile(player);
  }
  // ── Tile Resolution ──────────────────────────────────────────
  resolveTile(player) {
    const tile = BOARD[player.position];
    switch (tile.type) {
      case "property":
      case "railway":
      case "utility": {
        const prop = this.state.properties[tile.index];
        if (!prop) break;
        if (prop.ownerId === null) {
          if (canBuyProperty(player.id, tile.index, this.state)) {
            this.state.phase = "buyDecision";
          } else if (this.state.config.auctionOnDecline) {
            this.startAuction(tile.index);
          } else {
            this.state.phase = "rolling";
            this.finishTurnOrContinue();
          }
        } else if (prop.ownerId !== player.id && !prop.mortgaged) {
          const rentResult = calculateRent(tile.index, player.id, this.state);
          if (rentResult) {
            this.payRent(player, rentResult.amount, rentResult.ownerId);
          } else {
            this.finishTurnOrContinue();
          }
        } else {
          this.finishTurnOrContinue();
        }
        break;
      }
      case "tax":
        if (tile.taxPercentOption && this.state.config.incomeTaxChoice) {
          this.state.phase = "payingTax";
        } else {
          const amount = tile.taxAmount ?? 0;
          player.cash -= amount;
          this.addLog(`${player.name} paid \u20B9${amount} in ${tile.name}.`);
          this.finishTurnOrContinue();
        }
        break;
      case "card": {
        const deckType = tile.deck;
        const deckKey = deckType;
        const result = drawCard(this.state.decks[deckKey]);
        if (!result) {
          this.finishTurnOrContinue();
          break;
        }
        this.state.decks[deckKey] = result.remainingDeck;
        this.state.currentCard = result.card;
        this.addLog(`${player.name} drew: "${result.card.text}"`);
        this.resolveCardEffect(player, result.card);
        break;
      }
      case "corner":
        if (tile.cornerType === "goToJail") {
          this.addLog(`${player.name} landed on Go To Jail!`);
          this.goToJail(player);
          this.finishTurnOrContinue();
        } else {
          this.finishTurnOrContinue();
        }
        break;
      case "fee": {
        const fee = tile.fee ?? this.state.config.clubHouseFee;
        player.cash -= fee;
        this.addLog(`${player.name} paid \u20B9${fee} at ${tile.name}.`);
        this.finishTurnOrContinue();
        break;
      }
      case "skip":
        if (this.state.config.restHouseSkipsFullTurn) {
          player.skipNextTurn = true;
          this.addLog(`${player.name} landed on Rest House \u2014 will skip next turn.`);
        }
        this.finishTurnOrContinue();
        break;
    }
  }
  // ── Card Resolution ──────────────────────────────────────────
  resolveCardEffect(player, card) {
    const effect = card.effect;
    switch (effect.type) {
      case "advanceToGo":
      case "moveTo": {
        const target = effect.tileIndex ?? 0;
        if (target < player.position && this.state.config.passGoBonus > 0) {
          player.cash += this.state.config.passGoBonus;
        }
        player.position = target;
        this.resolveTile(player);
        return;
      }
      case "moveBack": {
        const spaces = effect.spaces ?? 0;
        player.position = moveBackward(player.position, spaces);
        this.resolveTile(player);
        return;
      }
      case "moveToNearest": {
        const target = findNearestTile(player.position, effect.nearestType ?? "railway");
        if (target < player.position && this.state.config.passGoBonus > 0) {
          player.cash += this.state.config.passGoBonus;
        }
        player.position = target;
        this.resolveTile(player);
        return;
      }
      case "collectFromBank":
        player.cash += effect.amount ?? 0;
        this.addLog(`${player.name} collected \u20B9${effect.amount} from the bank.`);
        break;
      case "payToBank":
        player.cash -= effect.amount ?? 0;
        this.addLog(`${player.name} paid \u20B9${effect.amount} to the bank.`);
        break;
      case "collectFromAll": {
        const amount = effect.amount ?? 0;
        const others = this.state.players.filter((p) => p.id !== player.id && !p.bankrupt);
        for (const other of others) {
          other.cash -= amount;
          player.cash += amount;
        }
        this.addLog(`${player.name} collected \u20B9${amount} from each player.`);
        break;
      }
      case "payPerHouseHotel": {
        const perHouse = effect.perHouse ?? 0;
        const perHotel = effect.perHotel ?? 0;
        let total = 0;
        for (const prop of Object.values(this.state.properties)) {
          if (prop.ownerId !== player.id) continue;
          if (prop.houses === 5) total += perHotel;
          else total += prop.houses * perHouse;
        }
        player.cash -= total;
        this.addLog(`${player.name} paid \u20B9${total} for property repairs.`);
        break;
      }
      case "goToJail":
        this.goToJail(player);
        break;
      case "getOutOfJailFree":
        player.getOutOfJailFreeCards += 1;
        this.addLog(`${player.name} received a Get Out of Jail Free card.`);
        break;
      case "rentFreePass":
        player.rentFreePass = true;
        this.addLog(`${player.name} has a rent-free pass for the next landing.`);
        break;
      case "swapPosition": {
        const others = this.state.players.filter((p) => p.id !== player.id && !p.bankrupt);
        if (others.length > 0) {
          const target = others[Math.floor(Math.random() * others.length)];
          const temp = player.position;
          player.position = target.position;
          target.position = temp;
          this.addLog(`${player.name} swapped positions with ${target.name}!`);
        }
        break;
      }
      case "doubleRent":
        player.rentCollectionMultiplier = 2;
        this.addLog(`${player.name}'s rent collection is doubled this round!`);
        break;
      case "skipOthersTurn": {
        const others = this.state.players.filter((p) => p.id !== player.id && !p.bankrupt);
        for (const other of others) {
          other.skipNextTurn = true;
        }
        this.addLog(`All other players will skip their next turn!`);
        break;
      }
      case "forceAuction": {
        const tile = BOARD[player.position];
        const prop = this.state.properties[player.position];
        if (prop && (tile.type === "property" || tile.type === "railway" || tile.type === "utility")) {
          this.startAuction(player.position);
          return;
        }
        break;
      }
    }
    this.state.currentCard = null;
    this.finishTurnOrContinue();
  }
  // ── Buy / Auction ────────────────────────────────────────────
  handleBuyProperty(playerId) {
    this.assertCurrentPlayer(playerId);
    this.assertPhase("buyDecision");
    const player = this.getCurrentPlayer();
    const tile = BOARD[player.position];
    const prop = this.state.properties[tile.index];
    if (!tile.price || !prop || prop.ownerId !== null) {
      throw new Error("Cannot buy this property.");
    }
    if (!canAfford(player, tile.price)) {
      throw new Error("Not enough cash.");
    }
    player.cash -= tile.price;
    prop.ownerId = player.id;
    this.addLog(`${player.name} bought ${tile.name} for \u20B9${tile.price}.`);
    this.finishTurnOrContinue();
  }
  handleDeclineBuy(playerId) {
    this.assertCurrentPlayer(playerId);
    this.assertPhase("buyDecision");
    const player = this.getCurrentPlayer();
    const tile = BOARD[player.position];
    this.addLog(`${player.name} declined to buy ${tile.name}.`);
    if (this.state.config.auctionOnDecline) {
      this.startAuction(tile.index);
    } else {
      this.finishTurnOrContinue();
    }
  }
  startAuction(tileIndex) {
    const activePlayers = getActivePlayers(this.state.players);
    this.state.auction = {
      tileIndex,
      currentBid: 0,
      currentBidderId: null,
      activeParticipants: activePlayers.map((p) => p.id),
      currentBidderTurnIndex: 0,
      passed: []
    };
    this.state.phase = "auction";
    this.addLog(`Auction started for ${BOARD[tileIndex].name}!`);
    this.resetAuctionTimer();
  }
  handlePlaceBid(playerId, amount) {
    this.assertPhase("auction");
    const auction = this.state.auction;
    const currentBidderId = auction.activeParticipants[auction.currentBidderTurnIndex];
    if (currentBidderId !== playerId) throw new Error("Not your turn to bid.");
    const player = this.getPlayer(playerId);
    if (amount <= auction.currentBid) throw new Error("Bid must be higher than current bid.");
    if (!canAfford(player, amount)) throw new Error("Cannot afford this bid.");
    auction.currentBid = amount;
    auction.currentBidderId = playerId;
    this.addLog(`${player.name} bid \u20B9${amount}.`);
    this.advanceAuction();
  }
  handlePassAuction(playerId) {
    this.assertPhase("auction");
    const auction = this.state.auction;
    const currentBidderId = auction.activeParticipants[auction.currentBidderTurnIndex];
    if (currentBidderId !== playerId) throw new Error("Not your turn to bid.");
    const player = this.getPlayer(playerId);
    auction.passed.push(playerId);
    auction.activeParticipants = auction.activeParticipants.filter((id) => id !== playerId);
    this.addLog(`${player.name} passed on the auction.`);
    if (auction.activeParticipants.length <= 1 && auction.currentBidderId) {
      this.resolveAuction();
    } else if (auction.activeParticipants.length === 0) {
      this.addLog("No one bid. Property remains unowned.");
      this.clearAuctionTimer();
      this.state.auction = null;
      this.finishTurnOrContinue();
    } else {
      if (auction.currentBidderTurnIndex >= auction.activeParticipants.length) {
        auction.currentBidderTurnIndex = 0;
      }
      if (auction.activeParticipants.length === 1 && auction.currentBidderId === auction.activeParticipants[0]) {
        this.resolveAuction();
      } else {
        this.resetAuctionTimer();
      }
    }
  }
  advanceAuction() {
    const auction = this.state.auction;
    auction.currentBidderTurnIndex = (auction.currentBidderTurnIndex + 1) % auction.activeParticipants.length;
    if (auction.activeParticipants[auction.currentBidderTurnIndex] === auction.currentBidderId) {
      if (auction.activeParticipants.length === 1) {
        this.resolveAuction();
      } else {
        auction.currentBidderTurnIndex = (auction.currentBidderTurnIndex + 1) % auction.activeParticipants.length;
        this.resetAuctionTimer();
      }
    } else {
      this.resetAuctionTimer();
    }
  }
  resolveAuction() {
    this.clearAuctionTimer();
    const auction = this.state.auction;
    if (!auction.currentBidderId || auction.currentBid <= 0) {
      this.addLog("Auction ended with no valid bid. Property remains unowned.");
      this.state.auction = null;
      this.finishTurnOrContinue();
      return;
    }
    const winner = this.getPlayer(auction.currentBidderId);
    const tile = BOARD[auction.tileIndex];
    const prop = this.state.properties[auction.tileIndex];
    winner.cash -= auction.currentBid;
    prop.ownerId = winner.id;
    this.addLog(`${winner.name} won the auction for ${tile.name} at \u20B9${auction.currentBid}.`);
    this.state.auction = null;
    this.finishTurnOrContinue();
  }
  // ── Rent ─────────────────────────────────────────────────────
  payRent(player, amount, ownerId) {
    const owner = this.getPlayer(ownerId);
    if (player.rentFreePass) {
      player.rentFreePass = false;
      this.addLog(`${player.name} used their rent-free pass!`);
      this.finishTurnOrContinue();
      return;
    }
    player.cash -= amount;
    owner.cash += amount;
    this.addLog(`${player.name} paid \u20B9${amount} rent to ${owner.name}.`);
    if (owner.rentCollectionMultiplier !== 1) {
      owner.rentCollectionMultiplier = 1;
    }
    this.finishTurnOrContinue();
  }
  // ── Jail ─────────────────────────────────────────────────────
  handlePayJailFine(playerId) {
    this.assertCurrentPlayer(playerId);
    const player = this.getCurrentPlayer();
    if (!player.inJail) throw new Error("Not in jail.");
    if (!canPayJailFine(player, this.state.config)) {
      throw new Error("Cannot afford jail fine.");
    }
    player.cash -= this.state.config.jailFine;
    const freed = releaseFromJail(player);
    Object.assign(player, freed);
    this.addLog(`${player.name} paid \u20B9${this.state.config.jailFine} to get out of jail.`);
    this.state.phase = "rolling";
  }
  handleUseJailCard(playerId) {
    this.assertCurrentPlayer(playerId);
    const player = this.getCurrentPlayer();
    if (!canUseJailCard(player)) throw new Error("No Get Out of Jail Free card.");
    player.getOutOfJailFreeCards -= 1;
    const freed = releaseFromJail(player);
    Object.assign(player, freed);
    this.addLog(`${player.name} used a Get Out of Jail Free card.`);
    this.state.phase = "rolling";
  }
  handleRollForJail(playerId) {
    this.assertCurrentPlayer(playerId);
    const player = this.getCurrentPlayer();
    if (!player.inJail) throw new Error("Not in jail.");
    const dice = rollDice();
    this.state.dice = dice;
    this.addLog(`${player.name} rolled ${dice.die1} + ${dice.die2} in jail.`);
    if (dice.isDoubles) {
      const freed = releaseFromJail(player);
      Object.assign(player, freed);
      this.addLog(`Doubles! ${player.name} is free!`);
      const { newPosition, passedGo } = movePosition(player.position, dice.total);
      player.position = newPosition;
      if (passedGo && this.state.config.passGoBonus > 0) {
        player.cash += this.state.config.passGoBonus;
      }
      this.addLog(`${player.name} landed on ${BOARD[newPosition].name}.`);
      this.resolveTile(player);
    } else {
      const updated = incrementJailTurn(player);
      Object.assign(player, updated);
      if (isJailFineForced(player, this.state.config)) {
        player.cash -= this.state.config.jailFine;
        const freed = releaseFromJail(player);
        Object.assign(player, freed);
        this.addLog(`${player.name} was forced to pay \u20B9${this.state.config.jailFine} after ${this.state.config.maxJailTurns} turns in jail.`);
        this.state.phase = "rolling";
      } else {
        this.addLog(`${player.name} stays in jail. (Turn ${player.jailTurns}/${this.state.config.maxJailTurns})`);
        this.advanceTurn();
      }
    }
  }
  // ── Tax ──────────────────────────────────────────────────────
  handlePayTax(playerId, choice) {
    this.assertCurrentPlayer(playerId);
    this.assertPhase("payingTax");
    const player = this.getCurrentPlayer();
    const amount = resolveTax(player.position, player.id, choice, this.state);
    player.cash -= amount;
    this.addLog(`${player.name} paid \u20B9${amount} in tax.`);
    this.finishTurnOrContinue();
  }
  // ── Turn Management ──────────────────────────────────────────
  handleEndTurn(playerId) {
    this.assertCurrentPlayer(playerId);
    this.advanceTurn();
  }
  finishTurnOrContinue() {
    if (isGameOver(this.state.players)) {
      const winner = getWinner(this.state.players);
      this.state.winner = winner?.id ?? null;
      this.state.phase = "gameOver";
      this.addLog(`Game over! ${winner?.name ?? "Nobody"} wins!`);
      return;
    }
    const player = this.getCurrentPlayer();
    if (this.state.dice?.isDoubles && !player.inJail && this.state.doublesCount > 0) {
      this.state.phase = "rolling";
      this.addLog(`${player.name} rolled doubles \u2014 roll again!`);
    } else {
      this.state.phase = "rolling";
      this.advanceTurn();
    }
  }
  advanceTurn() {
    this.state.doublesCount = 0;
    this.state.dice = null;
    this.state.currentCard = null;
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while (attempts < this.state.players.length) {
      const nextPlayer = this.state.players[nextIndex];
      if (!nextPlayer.bankrupt) {
        if (nextPlayer.skipNextTurn) {
          nextPlayer.skipNextTurn = false;
          this.addLog(`${nextPlayer.name}'s turn was skipped (Rest House).`);
          nextIndex = (nextIndex + 1) % this.state.players.length;
          attempts++;
          continue;
        }
        break;
      }
      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }
    this.state.currentPlayerIndex = nextIndex;
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.inJail) {
      this.state.phase = "inJail";
    } else {
      this.state.phase = "rolling";
    }
  }
  // ── Helpers ──────────────────────────────────────────────────
  goToJail(player) {
    const jailed = sendToJail(player);
    Object.assign(player, jailed);
    this.state.doublesCount = 0;
    this.addLog(`${player.name} is in Jail!`);
  }
  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerIndex];
  }
  getPlayer(playerId) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found.");
    return player;
  }
  assertCurrentPlayer(playerId) {
    const current = this.getCurrentPlayer();
    if (current.id !== playerId) throw new Error("Not your turn.");
  }
  assertPhase(expected) {
    if (this.state.phase !== expected) {
      throw new Error(`Invalid action for phase "${this.state.phase}". Expected "${expected}".`);
    }
  }
  addLog(message, playerId) {
    this.state.log.push({
      timestamp: Date.now(),
      message,
      playerId
    });
    if (this.state.log.length > 200) {
      this.state.log = this.state.log.slice(-100);
    }
  }
  createWaitingState(roomId) {
    return {
      roomId,
      config: { ...DEFAULT_CONFIG },
      players: [],
      properties: {},
      currentPlayerIndex: 0,
      phase: "waiting",
      dice: null,
      doublesCount: 0,
      decks: { chance: [], communityChest: [], surprise: [] },
      currentCard: null,
      auction: null,
      trade: null,
      turnOrder: [],
      winner: null,
      log: []
    };
  }
  // ── Messaging ────────────────────────────────────────────────
  sendTo(conn, message) {
    conn.send(JSON.stringify(message));
  }
  broadcastState() {
    if (!this.state) {
      this.state = this.createWaitingState(this.name);
    }
    const message = {
      type: "gameState",
      state: this.state
    };
    const serialized = JSON.stringify(message);
    this.broadcast(serialized);
  }
};
var server_default = {
  async fetch(request, env2, ctx) {
    const partyResponse = await routePartykitRequest(request, env2, { cors: true });
    if (partyResponse) return partyResponse;
    const url = new URL(request.url);
    const doBinding = env2.VyaparServer || env2.main;
    if (doBinding && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      const parts = url.pathname.split("/").filter(Boolean);
      const roomId = parts[parts.length - 1] || "default-room";
      const id = doBinding.idFromName(roomId);
      const stub = doBinding.get(id);
      return stub.fetch(request);
    }
    return new Response("Vyapar Multiplayer Server is running on Cloudflare Workers", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-OKgIHd/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = server_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-OKgIHd/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  VyaparServer,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=server.js.map
