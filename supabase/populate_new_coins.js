"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var https = require("https");
var SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
var COINGECKO_KEY = 'CG-unVU5nDtud2jHLq8eBU1shZ2';
var BATCH_SIZE = 500;
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
// Indicators (Reused)
function calculateSMA(prices, period) {
    if (prices.length < period)
        return null;
    return prices.slice(-period).reduce(function (a, b) { return a + b; }, 0) / period;
}
function calculateRSI(prices, period) {
    if (period === void 0) { period = 14; }
    if (prices.length < period + 1)
        return null;
    var gains = 0, losses = 0;
    for (var i = prices.length - period; i < prices.length; i++) {
        var diff = prices[i] - prices[i - 1];
        if (diff > 0)
            gains += diff;
        else
            losses -= diff;
    }
    var rs = (gains / period) / (losses / period);
    return 100 - (100 / (1 + rs));
}
function calculateBollingerBands(prices, period) {
    if (period === void 0) { period = 20; }
    if (prices.length < period)
        return { upper: null, lower: null };
    var slice = prices.slice(-period);
    var mean = slice.reduce(function (a, b) { return a + b; }, 0) / period;
    var variance = slice.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / period;
    var std = Math.sqrt(variance);
    return { upper: mean + 2 * std, lower: mean - 2 * std };
}
function toUnix(dateStr) { return Math.floor(new Date(dateStr).getTime() / 1000); }
function fetchRange(coinId, start, end) {
    return __awaiter(this, void 0, void 0, function () {
        var from, to;
        return __generator(this, function (_a) {
            from = toUnix(start);
            to = toUnix(end);
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var options = {
                        hostname: 'api.coingecko.com',
                        path: "/api/v3/coins/".concat(coinId, "/market_chart/range?vs_currency=usd&from=").concat(from, "&to=").concat(to),
                        headers: { 'x-cg-demo-api-key': COINGECKO_KEY }
                    };
                    https.get(options, function (res) {
                        var data = '';
                        res.on('data', function (chunk) { return data += chunk; });
                        res.on('end', function () { return resolve(JSON.parse(data)); });
                    }).on('error', reject);
                })];
        });
    });
}
function populateCoin(coinId, table, startYear) {
    return __awaiter(this, void 0, void 0, function () {
        var ranges, y, allPrices, _i, ranges_1, range, data, uniqueMap, closePrices, maxPrice, processed, sortedEntries, _a, sortedEntries_1, _b, date, price, _c, upper, lower, i, batch, error;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("\uD83D\uDE80 Starting ".concat(coinId, " history fetch (from ").concat(startYear, ")..."));
                    ranges = [];
                    for (y = 2026; y >= startYear; y--) {
                        ranges.push({ start: "".concat(y, "-01-01"), end: "".concat(y + 1, "-01-02") });
                    }
                    allPrices = [];
                    _i = 0, ranges_1 = ranges;
                    _d.label = 1;
                case 1:
                    if (!(_i < ranges_1.length)) return [3 /*break*/, 5];
                    range = ranges_1[_i];
                    console.log("   \uD83D\uDCE5 Fetching ".concat(range.start, " to ").concat(range.end, "..."));
                    return [4 /*yield*/, fetchRange(coinId, range.start, range.end)];
                case 2:
                    data = _d.sent();
                    if (data.prices && Array.isArray(data.prices)) {
                        allPrices = __spreadArray(__spreadArray([], allPrices, true), data.prices, true);
                    }
                    else {
                        console.warn("   \u26A0\uFE0F Warning: No data for range or error:", data.error || 'Empty');
                    }
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1500); })];
                case 3:
                    _d.sent(); // Rate limit
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    // Deduplicate
                    allPrices.sort(function (a, b) { return a[0] - b[0]; });
                    uniqueMap = new Map();
                    allPrices.forEach(function (_a) {
                        var ts = _a[0], price = _a[1];
                        var date = new Date(ts).toISOString().split('T')[0];
                        uniqueMap.set(date, price);
                    });
                    console.log("   \uD83D\uDCCA Processing ".concat(uniqueMap.size, " unique days..."));
                    closePrices = [];
                    maxPrice = 0;
                    processed = [];
                    sortedEntries = Array.from(uniqueMap.entries()).sort(function (a, b) { return new Date(a[0]).getTime() - new Date(b[0]).getTime(); });
                    for (_a = 0, sortedEntries_1 = sortedEntries; _a < sortedEntries_1.length; _a++) {
                        _b = sortedEntries_1[_a], date = _b[0], price = _b[1];
                        closePrices.push(price);
                        if (price > maxPrice)
                            maxPrice = price;
                        _c = calculateBollingerBands(closePrices, 20), upper = _c.upper, lower = _c.lower;
                        processed.push({
                            date: date,
                            close: price,
                            open: price, high: price, low: price, volume: 0, // Simplified OHLC
                            sma_50: calculateSMA(closePrices, 50),
                            sma_200: calculateSMA(closePrices, 200),
                            rsi: calculateRSI(closePrices, 14),
                            bb_upper: upper, bb_lower: lower,
                            drawdown_pct: ((price - maxPrice) / maxPrice) * 100
                        });
                    }
                    console.log("   \uD83D\uDCBE Uploading to ".concat(table, "..."));
                    i = 0;
                    _d.label = 6;
                case 6:
                    if (!(i < processed.length)) return [3 /*break*/, 9];
                    batch = processed.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, supabase.from(table).upsert(batch, { onConflict: 'date' })];
                case 7:
                    error = (_d.sent()).error;
                    if (error)
                        console.error("   ❌ Upsert Error:", error.message);
                    _d.label = 8;
                case 8:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("   \u2705 ".concat(coinId, " Done!"));
                    return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, populateCoin('ripple', 'xrp_data', 2014)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, populateCoin('solana', 'solana_data', 2020)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run().catch(console.error);
