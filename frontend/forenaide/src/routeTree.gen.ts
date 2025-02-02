/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as PipelineImport } from './routes/pipeline'
import { Route as ConfigImport } from './routes/config'
import { Route as IndexImport } from './routes/index'
import { Route as UploadIndexImport } from './routes/upload/index'

// Create/Update Routes

const PipelineRoute = PipelineImport.update({
  id: '/pipeline',
  path: '/pipeline',
  getParentRoute: () => rootRoute,
} as any)

const ConfigRoute = ConfigImport.update({
  id: '/config',
  path: '/config',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const UploadIndexRoute = UploadIndexImport.update({
  id: '/upload/',
  path: '/upload/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/config': {
      id: '/config'
      path: '/config'
      fullPath: '/config'
      preLoaderRoute: typeof ConfigImport
      parentRoute: typeof rootRoute
    }
    '/pipeline': {
      id: '/pipeline'
      path: '/pipeline'
      fullPath: '/pipeline'
      preLoaderRoute: typeof PipelineImport
      parentRoute: typeof rootRoute
    }
    '/upload/': {
      id: '/upload/'
      path: '/upload'
      fullPath: '/upload'
      preLoaderRoute: typeof UploadIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/config': typeof ConfigRoute
  '/pipeline': typeof PipelineRoute
  '/upload': typeof UploadIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/config': typeof ConfigRoute
  '/pipeline': typeof PipelineRoute
  '/upload': typeof UploadIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/config': typeof ConfigRoute
  '/pipeline': typeof PipelineRoute
  '/upload/': typeof UploadIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/config' | '/pipeline' | '/upload'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/config' | '/pipeline' | '/upload'
  id: '__root__' | '/' | '/config' | '/pipeline' | '/upload/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ConfigRoute: typeof ConfigRoute
  PipelineRoute: typeof PipelineRoute
  UploadIndexRoute: typeof UploadIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ConfigRoute: ConfigRoute,
  PipelineRoute: PipelineRoute,
  UploadIndexRoute: UploadIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/config",
        "/pipeline",
        "/upload/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/config": {
      "filePath": "config.tsx"
    },
    "/pipeline": {
      "filePath": "pipeline.tsx"
    },
    "/upload/": {
      "filePath": "upload/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
