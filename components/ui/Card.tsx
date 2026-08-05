import { HTMLAttributes } from "react";

export default function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-lg border border-gray-200 p-4 ${
        props.className ?? ""
      }`}
    />
  );
}
