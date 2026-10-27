import {test, expect, describe, vi} from "vitest"
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ScenePlayer from "./scene-player.tsx";

const steps = [
    {caption: "First", play: async() => {}},
    {caption: "Type a", play: async() => {}, check: {answer: "あ"}},
];

describe("Testing scene player", () => {
    test("Quiz steps block until answered", async() => {
        const user = userEvent.setup()
        const onComplete = vi.fn()
        render(<ScenePlayer steps={steps} onComplete={onComplete}/>)

        await user.click(screen.getByRole("button", {name: "Next"}));
        expect(screen.getByText("Type a")).toBeInTheDocument();
        const finish = screen.getByRole("button", {name: "Finish"});
        expect(finish).toBeDisabled();

        await user.type(screen.getByRole("textbox"), "a");
        expect(finish).toBeEnabled();
        await user.click(finish);
        expect(onComplete).toHaveBeenCalled();
    })
})
