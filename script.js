import http from 'k6/http';
import { check, sleep } from 'k6';


// export let options = {
//   stages: [
//     { duration: '30s', target: 20 },
//     { duration: '1m30s', target: 10 },
//     { duration: '20s', target: 0 },
//   ],
// };

 
const accessToken = __ENV.GITHUB_TOKEN;
const issueID = "MDU6SXNzdWU5ODM1MTQ0MDg=";

const query = `
{
      repository(name: "perf", owner: "KatKmiotek") {
        issue(number: 1) {
          comments(first: 10) {
            edges {
              node {
                bodyText
              }
            }
          }
        }
    }
  }`;

  const mutation = `
  mutation MyMutation {
    gitHub {
      addComment(input: { subjectId: "${issueID}", body: "hello" }){
        subject{
          id
        }
      }
    }
  }
  
  
  `;

const headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
};


export default function () {
    const res = http.post('https://api.github.com/graphql', JSON.stringify({ query: query }), { headers: headers });
    const comments = JSON.parse(res.body).data.repository.issue.comments.edges;
    check(res, 
        {
        "status is 200": () => res.status === 200,
        "has correct comment 1": () => comments[0].node.bodyText === "lets see",
        "has correct comment 2": () => comments[1].node.bodyText === "another one",
        "has correct comment 3": () => comments[2].node.bodyText === "3rd one",
    });

    const resMut = http.post('https://api.github.com/graphql', JSON.stringify({ query: mutation }), { headers: headers })
    console.log('response mutation', JSON.stringify(resMut.body));
}