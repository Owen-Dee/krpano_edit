export function deepClone(newObj, oldObj) {
    var obj = newObj || {};
    for (var key in oldObj) {
        var temp = oldObj[key];
        if (obj === temp) {
            continue;
        }
        if (typeof oldObj[key] === 'object') {
            obj[key] = (oldObj[key].constructor === Array) ? [] : {};
            deepClone(obj[key], oldObj[key]);
        } else {
            obj[key] = oldObj[key];
        }
    }

    return obj;
}