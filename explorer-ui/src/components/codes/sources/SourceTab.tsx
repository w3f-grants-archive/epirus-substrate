/* eslint-disable no-unused-vars */
import React, { Dispatch, Reducer, useEffect, useReducer } from "react"
import ErrorStatusView from "./ErrorView"
import ProcessingView from "./ProcessingView"
import VerifiedView from "./VerifiedView"
import { ReducerActionType, SourceTabAction, SourceTabState } from "../../../types/componentStates"
import UnverifiedView from "./UnverifiedView"
import { PageLoading } from "../../loading/Loading"
import api from "../../../apis/verifierApi"
import { useChainProperties } from "../../../contexts/ChainContext"
import { Warning } from "../../commons/Alert"
import { errMsg } from "../../../utils/errors"
import MetadataView from "./MetadataView"

const reducer: Reducer<SourceTabState, SourceTabAction> = (state, action) => {
  if (action.type === ReducerActionType.FETCHED) {
    return {
      ...state,
      status: action.info?.status,
      timestamp: action.info?.timestamp
    }
  } else if (action.type === ReducerActionType.ERROR) {
    return {
      ...state,
      error: action.error
    }
  } else {
    return {
      ...state,
      action: action.type
    }
  }
}

export interface SourceTabProps {
  codeHash: string,
  chain: string,
  dispatch: Dispatch<SourceTabAction>
}

export default function SourceTab (
  { id } :
  { id: string }
) {
  const { info } = useChainProperties()
  const [state, dispatch] = useReducer(
    reducer,
    {
      action: "init",
      status: undefined,
      timestamp: undefined,
      error: undefined
    }
  )
  const { action, status, timestamp, error } = state
  const chain = info || "local"

  useEffect(() => {
    async function getStatus () {
      try {
        const res = await api.info({ chain: info, codeHash: id })
        if ("status" in res) {
          dispatch({ type: ReducerActionType.FETCHED, info: res })
        } else {
          dispatch({ type: ReducerActionType.ERROR, error: res.message })
        }
      } catch (error: unknown) {
        dispatch({ type: ReducerActionType.ERROR, error: errMsg(error) })
      }
    }

    getStatus()
  }, [action])

  if (error) {
    return <Warning
      title="Error"
      message={error || "Unknown error."}
    />
  }

  if (
    status === undefined ||
    action === "uploading" ||
    status === "staging"
  ) {
    return <PageLoading loading={true} />
  }

  switch (status) {
  case "verified":
    return <VerifiedView codeHash={id} />
  case "processing":
    return <ProcessingView chain={chain} codeHash={id} dispatch={dispatch}/>
  case "metadata":
    return <MetadataView codeHash={id} sourceType="signed-metadata" />
  default:
    return (
      <>
        {
          status === "error" && <ErrorStatusView codeHash={id} timestamp={timestamp}/>
        }
        <UnverifiedView chain={chain} codeHash={id} dispatch={dispatch}/>
      </>
    )
  }
}
