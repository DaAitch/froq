
const JSON_TYPE = /^application\/json/i;
const TEXT_TYPE = /^text\//i;

export const isJsonType = type => {
    return JSON_TYPE.test(type);
};

export const isTextType = type => {
    return TEXT_TYPE.test(type);
};
