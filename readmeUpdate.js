import { readFileSync, writeFileSync } from "node:fs";
import Parser from "rss-parser";

// 기존 README.md 파일 읽기
const readmePath = "README.md";
let readmeContent = readFileSync(readmePath, "utf8");

// RSS 파서 생성
const parser = new Parser({
    headers: {
        Accept: "application/rss+xml, application/xml, text/xml; q=0.1",
    },
});

// 최신 블로그 포스트 추가하는 함수
(async () => {
    // 1. Tistory RSS 피드 가져오기
    const tistoryFeed = await parser.parseURL("https://realalpaca01.tistory.com/rss"); // Tistory RSS URL
    let tistoryPosts = "### Tistory Latest Blog Posts\n\n";
    for (let i = 0; i < 5 && i < tistoryFeed.items.length; i++) {
        const { title, link } = tistoryFeed.items[i];
        tistoryPosts += `- [${title}](${link})\n`;
    }

    // 2. Velog RSS 피드 가져오기
    const velogFeed = await parser.parseURL("https://v2.velog.io/rss/@yujin_jeong"); // Velog RSS URL
    let velogPosts = "### Velog Latest Blog Posts\n\n";
    for (let i = 0; i < 5 && i < velogFeed.items.length; i++) {
        const { title, link } = velogFeed.items[i];
        velogPosts += `- [${title}](${link})\n`;
    }

    // 3. 기존 README.md에 최신 블로그 포스트 추가
    const combinedPosts = `${tistoryPosts}\n${velogPosts}`;
    const newReadmeContent = readmeContent.includes("### Tistory Latest Blog Posts")
        ? readmeContent.replace(
            /### Tistory Latest Blog Posts[\s\S]*?(?=### Velog Latest Blog Posts|$)/,
            tistoryPosts + "\n" + velogPosts
        )
        : readmeContent + "\n" + combinedPosts;

    if (newReadmeContent !== readmeContent) {
        writeFileSync(readmePath, newReadmeContent, "utf8");
        console.log("README.md 업데이트 완료");
    } else {
        console.log("새로운 블로그 포스트가 없습니다. README.md 파일이 업데이트되지 않았습니다.");
    }
})();
