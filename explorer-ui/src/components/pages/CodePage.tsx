import React, { useMemo } from "react"

import { useParams } from "react-router-dom"
import useSquid from "../../hooks/useSquid"
import Box from "../commons/Box"
import Segment from "../commons/Segment"
import AccountLink from "../accounts/AccountLink"
import Breadcrumbs from "../navigation/Breadcrumbs"
import Tag from "../commons/Tag"
import Tabs, { TabItem } from "../navigation/Tabs"
import { Definition, DefinitionList } from "../commons/Definitions"
import { ContractCode } from "../../types/codes"
import { argValue } from "../../utils/types"
import { printBalance } from "../commons/Args"
import { useChainProperties } from "../../contexts/ChainContext"
import ContractTab, { contractByCodeHash } from "../contracts/ContractTab"
import BinaryTab from "../codes/BinaryTab"
import Copy from "../commons/Copy"
import { HexCallData, HexText } from "../commons/Hex"
import { CodeIcon } from "@heroicons/react/outline"

const QUERY = `
query($id: ID!) {
  contractCodes(where: {id_eq: $id}) {
    id
    createdAt
    createdFrom {
      blockHash
      blockNumber
      id
      hash
      name
      signer
      signature
      tip
      versionInfo
      args {
        type
        name
        value
      }
    }
    owner {
      id,
      contract {
        id
      }
    }
    contractsDeployed {
      id
    }
    removedOn
  }
}
`

export default function CodePage () {
  const { token } = useChainProperties()
  const params = useParams()
  const [result] = useSquid({
    query: QUERY,
    variables: { id: params.id },
    refresh: {
      disabled: true,
      millis: 0
    }
  })

  const { data, fetching } = result

  const tabs : TabItem[] = useMemo(() => {
    if (params.id) {
      return [
        {
          label: "Bytecode",
          to: "",
          element: <BinaryTab id={params.id} />
        },
        {
          label: "Instances",
          to: "contracts",
          element: <ContractTab
            currentId={params.id}
            where={contractByCodeHash(params.id)}
          />
        }
      ]
    }
    return []
  }, [params.id, fetching])

  if (fetching) {
    return null
  }

  const { id, createdAt, owner, createdFrom } = data?.contractCodes[0] as ContractCode
  const depositLimit = argValue(createdFrom.args, "storageDepositLimit")

  return (
    <>
      <Breadcrumbs/>
      <div className="content">

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-2">
          <Box className="col-span-2 divide-y gap-y-2">
            <div className="flex flex-row flex-wrap w-full items-start justify-between mt-4 gap-x-2">
              <h3 className="mx-5 mb-1 font-medium">
                <Copy text={id}>
                  <div className="flex gap-2 items-center text-sm">
                    <span className="bg-lime-200 rounded-full p-1.5">
                      <CodeIcon width={21} height={21} />
                    </span>
                    <HexText>{id}</HexText>
                  </div>
                </Copy>
              </h3>
              <div className="flex flex-row flex-wrap gap-x-2 px-4">
                <Tag label="wasm" />
              </div>
            </div>
            <Segment>
              <DefinitionList>
                <Definition label="Owner" term={
                  <AccountLink account={owner} size={21} />
                }/>
              </DefinitionList>
            </Segment>

            <Segment title="Upload details" collapsable={true} isOpen={false}>
              <DefinitionList>
                <Definition label="Block" term={
                  <span className="font-mono">{createdFrom.blockNumber}</span>
                }/>
                <Definition label="Time" term={
                  <span className="font-mono">{createdAt.toString()}</span>
                }/>
                <Definition label="Extrinsic" term={
                  <span className="font-mono">{createdFrom.id}</span>
                }/>

                <Definition label="Gas Limit" term={
                  <span className="font-mono">
                    {argValue(createdFrom.args, "gasLimit")}
                  </span>
                }/>
                <Definition label="Deposit Limit" term={
                  <span className="font-mono">
                    {depositLimit === "null" ? "unlimited" : depositLimit}
                  </span>
                }/>

                <Definition label="Data" term={
                  <HexCallData>
                    {argValue(createdFrom.args, "data")}
                  </HexCallData>
                }/>
                <Definition label="Salt" term={
                  <HexText>
                    {argValue(createdFrom.args, "salt")}
                  </HexText>
                }/>
              </DefinitionList>
            </Segment>
          </Box>
          <Box>
            <span>{printBalance(createdFrom.args, token)}</span>
          </Box>
        </div>

        <Box className="mt-2">
          <Tabs items={tabs} />
        </Box>
      </div>
    </>
  )
}
