import {test, expect, describe, beforeEach, vi} from "vitest"
import {getCompleted, isUnlocked, markCompleted} from "./progress.ts";

const lessons = [{id: "a"}, {id: "b"}, {id: "c"}];

describe("Testing lesson progress", () => {
    // Node's own localStorage shadows jsdom's one, so use an in-memory one
    beforeEach(() => {
        const store = new Map<string, string>();
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => store.set(key, String(value)),
        });
    })

    test("Completed lessons are remembered", () => {
        markCompleted("a");
        markCompleted("a");
        expect([...getCompleted()]).toEqual(["a"]);
    })

    test("A lesson unlocks when the previous one is completed", () => {
        const completed = new Set(["a"]);
        expect(isUnlocked(lessons, 0, completed)).toBe(true);
        expect(isUnlocked(lessons, 1, completed)).toBe(true);
        expect(isUnlocked(lessons, 2, completed)).toBe(false);
    })

    test("Corrupted storage is ignored", () => {
        localStorage.setItem("completed-lessons", "{oops");
        expect(getCompleted().size).toBe(0);
    })
})
