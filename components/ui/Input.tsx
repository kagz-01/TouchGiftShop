import { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
        props.className ?? ""
      }`}
    />
  );
}
