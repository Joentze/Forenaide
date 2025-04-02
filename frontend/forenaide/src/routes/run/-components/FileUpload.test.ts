import { test, expect, describe } from "vitest"
import { useFileStore } from "./FileUpload"
import { renderHook } from "@testing-library/react-hooks"

describe("store: test add files", async () => {
  // use renderHook to test the useFileStore hook outside of a component

  const { result: files } = renderHook(() => useFileStore(state => state.files))
  const { result: addFiles } = renderHook(() => useFileStore(state => state.addFiles))

  addFiles.current([new File(["hello world"], "file.txt")])

  // expect the file to be uploaded
  expect(files.current[0].fileObj.name).toEqual("file.txt")
})
