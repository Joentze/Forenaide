// operating under the assumption that each item in an array will be of the same type?
type Item = { [key: string]: any } & Object

interface FlattenObjOpts {
  keyDelimiter: string
  maxLevel?: number
  _level: number
  useCopy?: boolean
  flatten: boolean
}

const defaultFlattenObjOpts: FlattenObjOpts = {
  keyDelimiter: "_",
  _level: 0,
  useCopy: true,
  flatten: true
}

/**
 * Flattens nested objects and arrays into a flat array of objects.
 * This utility transforms complex nested structures into a single level
 * array suitable for conversion to CSV format.
 *
 * @param items - The item or array of items to flatten
 * @param opts - Options for controlling the flattening process
 * @returns The flattened array of items
 */

export function flatten(items: Item[] | Item, opts: Partial<FlattenObjOpts> = {}): Item[] {
  // Merge the provided options with default options
  const mergedOpts: FlattenObjOpts = { ...defaultFlattenObjOpts, ...opts };

  // If useCopy is enabled, create a deep copy of the items to avoid modifying the original data
  const itemsToProcess = mergedOpts.useCopy ? structuredClone(items) : items;

  // Call the internal flatten implementation with merged options
  return _flattenInternal(itemsToProcess, mergedOpts);
}

function _flattenInternal(items: Item[] | Item, opts: FlattenObjOpts): Item[] {
  let out: Item[] = []

  // for top level arrays
  if (items instanceof Array) {
    for (const item of items) {
      out = out.concat(flatten(item, opts)) // flatten arrays
    }
    return out
  }

  // ELSE: one object
  // flatten as per normal
  const obj = flattenObj(items, opts)

  let containsArrays = false

  for (const key of Object.keys(obj)) {
    // handle arrays within the object
    if (items[key] instanceof Array) {
      containsArrays = true
      const arr = items[key] // the item which is an array
      out.push(obj) // push first object

      if (arr.length === 0) {
        out[0][key] = null // empty cell
        continue
      }

      out[0][key] = arr[0] // first object value for that field is the first value of the array

      for (const arrItem of arr.slice(1)) {
        const itemToAdd = { ...items } // shallow Copy of surrounding fields
        itemToAdd[key] = arrItem // specific value for that row
        out.push(itemToAdd)
      }
    }
  }

  if (!containsArrays) return [obj] // single record

  // if you don't put it through flatten again, you might not end up fully flattening everything.
  // Example: You may have an array of arrays because of the flatten call on each item. You would still need to bring everything back to the top level.
  return flatten(
    out.map(it => flatten(it, opts)), opts)
}

export function flattenObj(item: Item, opts: FlattenObjOpts = defaultFlattenObjOpts): Item {
  // empty object
  if (isEmpty(item))
    return item

  for (const key of Object.keys(item)) {
    if (item[key] instanceof Array)
      continue

    // ignore non object structures.
    if (!(item[key] instanceof Object))
      continue

    const flattenItem = flattenObj(item[key])

    for (const flatKey of Object.keys(flattenItem)) {
      const newKey = `${key}${opts.keyDelimiter}${flatKey}`
      item[newKey] = flattenItem[flatKey]
    }

    delete item[key] // remove original record
  }

  // primitive
  return item
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0
}

/**
* Converts JSON data to a CSV string.
* @param json The JSON data to convert to CSV
* @param delimiter The delimiter to use between fields
* @param opts Options for controlling the conversion process
* @returns
*/
export function convertToString(json: Item[] | Item, delimiter: string = ",", opts: Partial<FlattenObjOpts> = defaultFlattenObjOpts): string {
  if (json.length === 0) return ""

  const mergedOpts: FlattenObjOpts = { ...defaultFlattenObjOpts, ...opts };
  const itemsToProcess = mergedOpts.useCopy ? structuredClone(json) : json;

  // any array we meet must have items of the same type
  let flattenedArray: Item[] = json as Item[]

  if (mergedOpts.flatten) {
    flattenedArray = flatten(itemsToProcess, mergedOpts)
  }

  const keys = Object.keys(flattenedArray[0]).sort()

  // add headers
  const header = keys.join(delimiter) + "\n"

  const out = flattenedArray
    .map(row =>
      keys.map(key => {
        const item = row[key]
        return item
      })
        .map(escapeCsvValue)
        .join(delimiter)
    )
    .join("\n")

  // if not empty, pad ending with \n
  return (out == "") ? "" : (header + out) + "\n"
}

/**
* Returns a generator that returns CSV rows for the given JSON data.
* @param json The JSON data to convert to CSV
* @param delimiter The delimiter to use between fields
* @param opts Options for controlling the conversion process
*/

export function* makeRowGenerator(json: Item[] | Item, delimiter: string = ",", opts: FlattenObjOpts = defaultFlattenObjOpts): IterableIterator<string> {
  if (json.length === 0) yield ""

  const mergedOpts: FlattenObjOpts = { ...defaultFlattenObjOpts, ...opts };
  const itemsToProcess = mergedOpts.useCopy ? structuredClone(json) : json;

  // any array we meet must have items of the same type
  let flattenedArray: Item[] = json as Item[]

  if (mergedOpts.flatten) {
    flattenedArray = flatten(itemsToProcess, mergedOpts)
  }

  const keys = Object.keys(flattenedArray[0]).sort()
  const header = keys.join(delimiter) + "\n"

  yield header

  for (const row of flattenedArray) {
    let csvRow = keys.map(key => {
      const item = row[key]
      return item
    })
      .map(escapeCsvValue)
      .join(delimiter)

    csvRow += "\n"
    yield csvRow;
  }
}

export function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If the value contains delimiter, quotes, or newlines, wrap in quotes and escape any quotes
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}
