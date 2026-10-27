import {type ChangeEvent, type ComponentProps, useLayoutEffect, useRef, useState} from "react";
import {parseToKana} from "./kana.ts";

type KanaInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
    onValueChange?: (value: string) => void
};

const KanaInput = ({onValueChange, ...props}: KanaInputProps) => {
    const [inputted, setInputted] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        const location = selectRef.current;

        if(location){
            inputRef.current?.setSelectionRange(location, location)
            selectRef.current = null;
        }
    });

    const changeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const {output, newCursorPosition} = parseToKana(e.target.value, e.target.selectionStart ?? 0);
        setInputted(output)
        onValueChange?.(output)
        selectRef.current = newCursorPosition
    }

    return (
        <input {...props} ref={inputRef} type="text" value={inputted} onChange={changeInput}/>
    );
};

export default KanaInput;
