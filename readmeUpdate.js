import { readFileSync, writeFileSync } from "node:fs";
import Parser from "rss-parser";

const readmePath = "README.md";
let readmeContent = readFileSync(readmePath, "utf8");

// 요청 헤더 설정
const parser = new Parser({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept": "application/rss+xml, application/xml, text/xml",
    },
});

(async () => {
    try {
        // RSS 피드 가져오기
        const tistoryFeed = await parser.parseURL("https://realalpaca01.tistory.com/rss");
        const velogFeed = await parser.parseURL("https://v2.velog.io/rss/@yujin_jeong");

        // Tistory 블로그 포스트 생성
        let tistoryPosts = "### Tistory Latest Blog Posts\n\n";
        for (let i = 0; i < 5 && i < tistoryFeed.items.length; i++) {
            const { title, link } = tistoryFeed.items[i];
            tistoryPosts += `- [${title}](${link})\n`;
        }

        // Velog 블로그 포스트 생성
        let velogPosts = "### Velog Latest Blog Posts\n\n";
        for (let i = 0; i < 5 && i < velogFeed.items.length; i++) {
            const { title, link } = velogFeed.items[i];
            velogPosts += `- [${title}](${link})\n`;
        }

        // 기존 README에서 섹션을 교체
        const combinedPosts = `${tistoryPosts}\n\n${velogPosts}`; // Tistory와 Velog 섹션 사이에 줄바꿈 추가
        let newReadmeContent = readmeContent;

        if (readmeContent.includes("### Tistory Latest Blog Posts")) {
            newReadmeContent = newReadmeContent.replace(
                /### Tistory Latest Blog Posts[\s\S]*?(?=### Velog Latest Blog Posts|$)/,
                tistoryPosts.trim()
            );
        } else {
            newReadmeContent += `\n${tistoryPosts}`;
        }

        if (readmeContent.includes("\n### Velog Latest Blog Posts")) {
            newReadmeContent = newReadmeContent.replace(
                /### Velog Latest Blog Posts[\s\S]*?(?=$)/,
                velogPosts.trim()
            );
        } else {
            newReadmeContent += `\n${velogPosts}`;
        }

        // 파일 쓰기 조건 확인
        if (newReadmeContent !== readmeContent) {
            console.log("README.md 변경 사항:\n", newReadmeContent);
            writeFileSync(readmePath, newReadmeContent, "utf8");
            console.log("README.md 업데이트 완료");
            process.exit(0); // 정상 종료
        } else {
            console.log("새로운 블로그 포스트가 없습니다.");
            process.exit(0); // 정상 종료
        }
    } catch (error) {
        console.error("RSS 피드 처리 중 오류 발생:", error.message);
        console.error(error.stack); // 에러 스택도 출력
        process.exit(1); // 오류 발생 시 실패 처리
    }
})();
