module.exports = {
    title: "chnherb's blog",
    description: "chnherb's blog about computer technology",
    author: "chnherb",
    lang: "zh-cn",
    plugins: [
        "-lunr", "-search", "search-pro",
        "back-to-top-button",
        "chapter-fold",
        "code",
        "splitter",
        "intopic-toc",
    ],
    pluginsConfig: {
        "code": {
            "copyButtons": true
        },
        "intopic-toc": {
            "label": "CONTENTS",
            "selector": ".markdown-section h1, .markdown-section h2, .markdown-section h3, .markdown-section h4, .markdown-section h5, .markdown-section h6",
            "mode": "nested",
            "maxDepth": 3,
            "isCollapsed": false,
            "isScrollspyActive": true,
            "visible": true,
        },
    },
    variables: {
    },
};