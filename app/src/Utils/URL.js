export const isURL = (input) => {
    const pattern = /^((?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)|flast:\/\/\S.*|flast-file:\/\/\S.*|file:\/\/\S.*)\S*$/;

    return pattern.test(input) ? true : pattern.test(`http://${input}`);
}

export const prefixHttp = (url) => {
    url = url.trim();
    return url.includes('://') ? url : `http://${url}`;
}