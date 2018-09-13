export function deepClone(newObj, oldObj) {
    let obj = newObj || {};
    for (let key in oldObj) {
        let temp = oldObj[key];
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

export function getUrlParam(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let str = window.location.href.split('?')[1];
    if (!str) {
        return '';
    }

    let r = str.match(reg);
    if (r != null) {
        return unescape(r[2]);
    }

    return '';
};