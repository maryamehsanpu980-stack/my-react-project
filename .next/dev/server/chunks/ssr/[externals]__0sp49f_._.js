module.exports = [
"[externals]/react-leaflet [external] (react-leaflet, esm_import, [project]/node_modules/react-leaflet)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("react-leaflet-0d15a688ff7d710a");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/leaflet [external] (leaflet, cjs, [project]/node_modules/leaflet)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("leaflet-dd35bdd58107d823", () => require("leaflet-dd35bdd58107d823"));

module.exports = mod;
}),
];