// ── Shared app state ──────────────────────────────────────────────────────────

const State = (() => {
    let _data = [];
    return {
        get data() { return _data; },
        set data(v) { _data = Array.isArray(v) ? v : []; },
        get hasData() { return _data.length > 0; },
    };
})();
