type MatchResult = {
    fullMatch: string;
    start: number;
    end: number;
    groups: Array<{ start: number; end: number; value: string } | null>;
};

export class RegexMatcher {
    readonly text: string;
    readonly pattern: string;
    readonly flags: string;
    private regex: RegExp;

    constructor(text: string, pattern: string, flags: string) {
        this.text = text;
        this.pattern = pattern;
        this.flags = flags;
        this.regex = new RegExp(pattern, flags);
    }

    getMatches(): MatchResult[] {
        const results: MatchResult[] = [];
        let match: RegExpExecArray | null;

        while ((match = this.regex.exec(this.text)) !== null) {
            const fullMatch = match[0];
            const start = match.index;
            const end = start + fullMatch.length;

            const groups: MatchResult["groups"] = [];
            let currentPos = start;

            for (let i = 1; i < match.length; i++) {
                const group = match[i];
                if (group === undefined) {
                    groups.push(null);
                    continue;
                }

                const groupStartWithinMatch = fullMatch.indexOf(group, currentPos - start);
                const groupStart = start + groupStartWithinMatch;
                const groupEnd = groupStart + group.length;

                groups.push({
                    start: groupStart,
                    end: groupEnd,
                    value: group
                });

                currentPos = groupEnd;
            }

            results.push({ fullMatch, start, end, groups });

            if (match[0].length === 0) {
                this.regex.lastIndex++;
            }
        }
        return results;
    }
}

// Test
