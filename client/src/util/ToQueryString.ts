export function toQueryString(
    params: Record<string, string | number | boolean | undefined>
) {
    return new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    ).toString();
}
