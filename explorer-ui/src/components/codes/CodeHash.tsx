import { CodeIcon } from "@heroicons/react/solid"
import React from "react"
import { classNames } from "../../utils/strings"
import { AddressText } from "../commons/Text"

export default function CodeHash ({
  hash,
  size = 16,
  padding = "p-0.5",
  className = ""
}: {
  hash: string,
  padding?: string,
  size?: number,
  className?: string
}) {
  return (
    <div className={classNames("flex gap-2 items-center text-sm", className)}>
      <span className={classNames("bg-lime-200 rounded-full", padding)}>
        <CodeIcon width={size} height={size} />
      </span>
      <AddressText address={hash} />
    </div>
  )
}