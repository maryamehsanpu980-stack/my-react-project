module.exports = [
"[project]/src/App.jsx [ssr] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_02j7-l7._.js",
  "server/chunks/ssr/[externals]__0sp49f_._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/App.jsx [ssr] (ecmascript, next/dynamic entry)");
    });
});
}),
];