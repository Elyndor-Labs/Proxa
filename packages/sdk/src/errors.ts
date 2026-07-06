import proxaIdl from "./idl/proxa.json";

export interface ProxaErrorInfo {
  code: number;
  name: string;
  msg?: string;
}

const ERROR_LIST = ((proxaIdl as { errors?: ProxaErrorInfo[] }).errors ?? []) as ProxaErrorInfo[];
const BY_CODE = new Map<number, ProxaErrorInfo>(ERROR_LIST.map((e) => [e.code, e]));

export function proxaErrorByCode(code: number): ProxaErrorInfo | undefined {
  return BY_CODE.get(code);
}

export function proxaErrorName(code: number): string | undefined {
  return BY_CODE.get(code)?.name;
}

// Best-effort extraction of a Proxa program error from a thrown anchor/web3 error.
export function parseProxaError(err: unknown): ProxaErrorInfo | undefined {
  const e = err as {
    error?: { errorCode?: { number?: number; code?: string } };
    logs?: string[];
    message?: string;
  };
  const num = e?.error?.errorCode?.number;
  if (typeof num === "number") {
    return BY_CODE.get(num) ?? { code: num, name: e.error?.errorCode?.code ?? "Unknown" };
  }
  const text = `${e?.logs?.join("\n") ?? ""}\n${e?.message ?? ""}`;
  const decimal = text.match(/Error Number: (\d+)/);
  if (decimal) return BY_CODE.get(Number(decimal[1])) ?? { code: Number(decimal[1]), name: "Unknown" };
  const hex = text.match(/custom program error: 0x([0-9a-fA-F]+)/);
  if (hex) {
    const code = parseInt(hex[1], 16);
    return BY_CODE.get(code) ?? { code, name: "Unknown" };
  }
  return undefined;
}
