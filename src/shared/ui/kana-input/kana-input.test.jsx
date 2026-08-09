import {test, expect, describe} from "vitest"
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import KanaInput from "./kana-input.jsx";

describe("Testing kana input component", () => {
    test("Basic input test", async() => {
        const user = userEvent.setup()
        render(<KanaInput/>)
        const input = screen.getByRole("textbox");
        await user.type(input, "konnnichiha");
        expect(input).toHaveValue("こんにちは")
    })

    test("Cursor move test", async() => {
        const user = userEvent.setup()
        render(<KanaInput/>)
        const input = screen.getByRole("textbox");
        await user.type(input, "koha{ArrowLeft}nnnichi");
        expect(input).toHaveValue("こんにちは")
    })
});