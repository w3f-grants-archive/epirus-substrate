import React from "react"

import { Activity } from "../../types/contracts"
import { Row, TypedRow } from "../commons/List"
import { shortDate } from "../../formats/time"
import AccountLink from "../accounts/AccountLink"
import { classNames } from "../../utils/strings"
import Lane from "../commons/Lane"
import { Label } from "../commons/Label"
import { getArgValue } from "../commons/Args"
import { useChainProperties } from "../../contexts/ChainContext"
import { AccountUnit } from "../commons/Text"

function typeAlias (type: string) {
  switch (type) {
  case "CONTRACT":
    return "instantiate"
  case "CONTRACTCALL":
    return "call"
  case "CODEUPDATED":
    return "upgrade"
  default:
    return type
  }
}

export default function ActivityRow ({
  obj,
  currentId,
  short = true
}: TypedRow<Activity>) {
  const { token } = useChainProperties()
  const { id, from, to, type, createdAt } = obj
  const alias = typeAlias(type)

  return (
    <Row key={id}>
      <Lane
        head={
          <div className="flex flex-col gap-2">
            <div className={classNames(
              `tag ${alias}`,
              "w-24 text-[0.68rem] font-semibold uppercase py-0.5 px-1 rounded text-center"
            )}>
              {`${alias}`}
            </div>
            <Label className="text-xs">{shortDate(createdAt)}</Label>
          </div>
        }
        tail={
          <AccountUnit
            className="text-sm"
            amount={getArgValue(obj.args)}
            token={token}
          />
        }
      >
        {from &&
          (<div className="flex gap-2 text-sm">
            <Label>From</Label>
            <AccountLink account={from} currentId={currentId} short={short} size={21} />
          </div>)
        }
        {to &&
          (<div className="flex gap-2 text-sm">
            <Label>To</Label>
            <AccountLink account={to} currentId={currentId} short={short} size={21} />
          </div>)
        }
      </Lane>
    </Row>
  )
}
