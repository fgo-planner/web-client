export namespace StyleUtils {

    export function insetBoxShadow(boxShadow: string): string {
        boxShadow = boxShadow.replaceAll(/,\s*(\d+px)/gi, ', inset $1');
        return `inset ${boxShadow}`;
    }

}
