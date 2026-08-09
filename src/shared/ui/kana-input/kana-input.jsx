import {useLayoutEffect, useMemo, useRef, useState} from "react";
import {isKana, kanaMap, parseToKana} from "./kana.js";

const KanaInput = ({onChanged}) => {
    const [inputed, setInputed] = useState("");
    const [selectLocation, setSelectLocation] = useState(null);
    /**
     *
     * @type {React.RefObject<HTMLInputElement>}
     */
    const inputRef = useRef(null);

    useLayoutEffect(() => {
        if(selectLocation){
            inputRef.current.setSelectionRange(selectLocation, selectLocation)
            setSelectLocation(null);
        }
    });

    const changeInput = (e) => {
        const {output, newCursorPosition} = parseToKana(e.target.value, e.target.selectionStart);
        setInputed(output)
        setSelectLocation(newCursorPosition);
    }

    return (
        <input ref={inputRef} type="text" value={inputed} onChange={changeInput}/>
    );
};

export default KanaInput;