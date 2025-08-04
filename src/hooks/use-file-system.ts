"use client"

import { useState, useEffect } from "react"

interface FolderItem {
  name: string
  isDirectory: boolean
  path: string
}

export function useFileSystem() {
  const [currentFolder, setCurrentFolder] = useState<string>("")
  const [folderContents, setFolderContents] = useState<FolderItem[]>([])

  useEffect(() => {
    if (currentFolder) {
      loadFolderContents(currentFolder)
    }
  }, [currentFolder])

  const loadFolderContents = async (folderPath: string) => {
    try {
      const contents = await window.ipcRenderer?.invoke("get-folder-contents", folderPath)
      setFolderContents(contents || [])
    } catch (error) {
      console.error("フォルダ内容の読み込みエラー:", error)
      setFolderContents([])
    }
  }

  const openFolderDialog = async () => {
    try {
      const folderPath = await window.ipcRenderer?.invoke("open-folder-dialog")
      if (folderPath) {
        setCurrentFolder(folderPath)
      }
    } catch (error) {
      console.error("フォルダダイアログエラー:", error)
    }
  }

  const navigateToParent = () => {
    if (currentFolder) {
      const parentFolder = currentFolder.split("\\").slice(0, -1).join("\\")
      if (parentFolder) {
        setCurrentFolder(parentFolder)
      }
    }
  }

  const openItem = async (item: FolderItem) => {
    if (item.isDirectory) {
      setCurrentFolder(item.path)
    } else if (item.path.toLowerCase().endsWith(".txt")) {
      openNotepad(item.path)
    } else if (item.path.toLowerCase().endsWith(".py")) {
      // Pythonファイルを実行
    }
  }

  const openNotepad = async (filePath?: string) => {
    try {
      await window.ipcRenderer?.invoke("open-notepad", filePath)
    } catch (error) {
      console.error("メモ帳を開くエラー:", error)
    }
  }

  return {
    currentFolder,
    folderContents,
    openFolderDialog,
    navigateToParent,
    openItem,
    openNotepad,
  }
}
