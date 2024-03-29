import AesEncryptionInstance, { AesEncryption } from "./cipher"
// const EXTRA_RESERVED_RE = /[!'()*]/g
// const encodeReservedReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16)
const HASH_RE = /#/g // %23
const AMPERSAND_RE = /&/g // %26
const SLASH_RE = /\//g // %2F
const EQUAL_RE = /=/g // %3D
const IM_RE = /\?/g // %3F
const PLUS_RE = /\+/g // %2B
export const EQUAL2_RE = /%253D/g

const ENC_BRACKET_OPEN_RE = /%5B/g // [
const ENC_BRACKET_CLOSE_RE = /%5D/g // ]
const ENC_CARET_RE = /%5E/g // ^
const ENC_BACKTICK_RE = /%60/g // `
const ENC_CURLY_OPEN_RE = /%7B/g // {
const ENC_PIPE_RE = /%7C/g // |
const ENC_CURLY_CLOSE_RE = /%7D/g // }
const ENC_SPACE_RE = /%20/g // }

/**
 * Encode characters that need to be encoded on the path, search and hash
 * sections of the URL.
 *
 * @internal
 * @param text - string to encode
 * @returns encoded string
 */
function commonEncode(text) {
  return encodeURI('' + text)
    .replace(ENC_PIPE_RE, '|')
    .replace(ENC_BRACKET_OPEN_RE, '[')
    .replace(ENC_BRACKET_CLOSE_RE, ']')
}

/**
 * Encode characters that need to be encoded on the hash section of the URL.
 *
 * @param text - string to encode
 * @returns encoded string
 */
function encodeHash(text) {
  return commonEncode(text)
    .replace(ENC_CURLY_OPEN_RE, '{')
    .replace(ENC_CURLY_CLOSE_RE, '}')
    .replace(ENC_CARET_RE, '^')
}

/**
 * Encode characters that need to be encoded query values on the query
 * section of the URL.
 *
 * @param text - string to encode
 * @returns encoded string
 */
function encodeQueryValue(text) {
  return commonEncode(text)
    .replace(PLUS_RE, '%2B')
    .replace(ENC_SPACE_RE, '+')
    .replace(HASH_RE, '%23')
    .replace(AMPERSAND_RE, '%26')
    .replace(ENC_BACKTICK_RE, '`')
    .replace(ENC_CURLY_OPEN_RE, '{')
    .replace(ENC_CURLY_CLOSE_RE, '}')
    .replace(ENC_CARET_RE, '^')
}

/**
 * Like `encodeQueryValue` but also encodes the `=` character.
 *
 * @param text - string to encode
 */
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, '%3D')
}

/**
 * Encode characters that need to be encoded on the path section of the URL.
 *
 * @param text - string to encode
 * @returns encoded string
 */
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, '%23').replace(IM_RE, '%3F')
}

/**
 * Encode characters that need to be encoded on the path section of the URL as a
 * param. This function encodes everything {@link encodePath} does plus the
 * slash (`/`) character. If `text` is `null` or `undefined`, returns an empty
 * string instead.
 *
 * @param text - string to encode
 * @returns encoded string
 */
function encodeParam(text) {
  return text == null ? '' : encodePath(text).replace(SLASH_RE, '%2F')
}

/**
 * Decode text using `decodeURIComponent`. Returns the original text if it
 * fails.
 *
 * @param text - string to decode
 * @returns decoded string
 */
function decode(text) {
  try {
    return decodeURIComponent('' + text)
  } catch (err) {
    console.log(`Error decoding "${text}". Using original value`)
  }
  return '' + text
}

const isArray = Array.isArray

/**
 * 将字符串转为对象
 * @param {string} text 
 * @returns {object}
 */
function stringToObject(text) {
  let array = text.split('&')
  let result = {}
  array.forEach(text => {
    let index = text.indexOf("=")
    let key = text.slice(0, index)
    let value = text.slice(index + 1)
    result[key] = value
  })
  return result
}
/**
 * vue-router序列化query参数的Func-加密
 * Stringifies a {@link LocationQueryRaw} object. Like `URLSearchParams`, it
 * doesn't prepend a `?`
 *
 * @internal
 *
 * @param query - query object to stringify
 * @returns string version of the query without the leading `?`
 */
export function stringifyQuery(query) {
  let search = ''
  for (let key in query) {
    const value = query[key]
    key = encodeQueryKey(key)
    if (value == null) {
      // only null adds the value
      if (value !== undefined) {
        search += (search.length ? '&' : '') + key
      }
      continue
    }

    // keep null values
    const values = isArray(value)
      ? value.map(v => v && encodeQueryValue(v))
      : [value && encodeQueryValue(value)]

    values.forEach(value => {
      // skip undefined values in arrays as if they were not present
      // smaller code than using filter
      if (value !== undefined) {
        // only append & with non-empty search
        search += (search.length ? '&' : '') + key
        if (value != null) search += '=' + value
      }
    })
  }
  // 加密
  if (import.meta.env.VITE_IS_ROUTE_CIPHER === 'true') {
    search = search.length ? 'cipher=' + AesEncryptionInstance.encryptByAES(search) : search
  }
  return search
}

/**
 * vue-router反序列号query参数的Func-解密
 * Transforms a queryString into a {@link LocationQuery} object. Accept both, a
 * version with the leading `?` and without Should work as URLSearchParams

 * @internal
 *
 * @param search - search string to parse
 * @returns a query object
 */
export function parseQuery(search) {
  const query = {}
  // avoid creating an object with an empty key and empty value
  // because of split('&')
  if (search === '' || search === '?') return query
  const hasLeadingIM = search[0] === '?'
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&')
  // 解密
  const searchString = import.meta.env.VITE_IS_ROUTE_CIPHER === 'true' && searchParams[0].startsWith('cipher=') ? AesEncryptionInstance.decryptByAES(searchParams[0].slice(7)).split("&") : searchParams

  for (let i = 0; i < searchString.length; ++i) {
    // pre decode the + into space
    const searchParam = searchString[i].replace(PLUS_RE, ' ')
    // allow the = character
    const eqPos = searchParam.indexOf('=')
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos))
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1))
    if (key in query) {
      // an extra variable for ts types
      let currentValue = query[key]
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue]
      }
      // we force the modification
      currentValue.push(value)
    } else {
      query[key] = value
    }
  }
  return query
}

/**
 * AES解密
 * @param {string} text 
 * @returns 
 */
function toDecryptByAES(text) {
  try {
    text = AesEncryptionInstance.decryptByAES(text) || text
    return text
  } catch (error) {
    console.log(`Error ciphering: "${error}". Using original value`);
  }
  return text
}

/**
 * 解析带?的url
 * @param {string} url 
 */
export function parseUrl(url) {
  const index = url.indexOf('?')
  const query = {}
  if (url === '' || url === '/' || url === '?' || url.indexOf('?') === -1) return query

  const search = url.slice(index + 1)
  const searchParams = search.split('&')
  for (let i = 0; i < searchParams.length; ++i) {
    // pre decode the + into space
    const searchParam = searchParams[i].replace(PLUS_RE, ' ').replace(SPACE_RE, '=')
    // allow the = character
    const eqPos = searchParam.indexOf('=')
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos))
    const value = toDecryptByAES(eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1)))


    if (key in query) {
      // an extra variable for ts types
      let currentValue = query[key]
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue]
      }
      // we force the modification
      currentValue.push(value)
    } else {
      query[key] = value
    }
  }
  return query
}