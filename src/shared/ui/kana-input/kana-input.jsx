import {useLayoutEffect,  useRef, useState} from "react";
import {parseToKana} from "./kana.js";

const KanaInput = () => {
    const [inputted, setInputted] = useState("");
    /**
     *
     * @type {React.RefObject<HTMLInputElement>}
     */
    const inputRef = useRef(null);
    const selectRef = useRef(null);

    useLayoutEffect(() => {
        const location = selectRef.current;

        if(location){
            inputRef.current.setSelectionRange(location, location)
            selectRef.current = null;
        }
    });

    const changeInput = (e) => {
        const {output, newCursorPosition} = parseToKana(e.target.value, e.target.selectionStart);
        setInputted(output)
        selectRef.current = newCursorPosition
    }

    return (
        <input ref={inputRef} type="text" value={inputted} onChange={changeInput}/>
    );
};

export default KanaInput;