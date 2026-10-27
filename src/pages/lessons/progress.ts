const STORAGE_KEY = "completed-lessons";

/**
 * Read the ids of the completed lessons
 */
export const getCompleted = (): Set<string> => {
    try {
        return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]);
    } catch {
        return new Set();
    }
};

/**
 * Save a lesson as completed
 * @param id the lesson id
 */
export const markCompleted = (id: string) => {
    const completed = getCompleted().add(id);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
        // Progress just won't be remembered
    }
};

/**
 * A lesson is unlocked when it is the first one or the previous one is completed
 * @param lessons the ordered lessons of the path
 * @param index the index of the lesson to check
 * @param completed the completed lesson ids
 */
export const isUnlocked = (lessons: {id: string}[], index: number, completed: Set<string>) =>
    index === 0 || completed.has(lessons[index - 1].id);
