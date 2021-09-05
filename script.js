import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomSeed } from 'k6';


// export let options = {
//   stages: [
//     { duration: '30s', target: 20 },
//     { duration: '1m30s', target: 10 },
//     { duration: '20s', target: 0 },
//   ],
// };


const accessToken = __ENV.GITHUB_TOKEN;
const issueID = "MDU6SXNzdWU5ODM1MTQ0MDg=";

let randomNum = Math.random();

const commText = "comment " + randomNum


const query = `
{
      repository(name: "perf_graphql_k6", owner: "KatKmiotek") {
        issue(number: 1) {
          comments(first: 10) {
            edges {
              node {
                bodyText
                id
              }
            }
          }
        }
    }
  }`;

const mutation = `
      mutation add {
      addComment(input:{subjectId:"${issueID}",body:"${commText}"}) {
        subject {
          id
        }
      }
} 
  `;

const deleteMut = `
mutation delete($id: ID!) {
      deleteIssueComment(
        input: {
          id: $id
        }
      ) {
         clientMutationId
      }
    }
`;

const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
};


export default function () {

    // QUERY GET

    const res = http.post('https://api.github.com/graphql', JSON.stringify({ query: query }), { headers: headers });
    const comments = JSON.parse(res.body).data.repository.issue.comments.edges;
    let commentID = JSON.parse(res.body).data.repository.issue.comments.edges[7].node.id
    check(res,
        {
            "status is 200": () => res.status === 200,
            "has correct comment 1": () => comments[0].node.bodyText === "lets see",
            "has correct comment 2": () => comments[1].node.bodyText === "another one",
            "has correct comment 3": () => comments[2].node.bodyText === "3rd one",
        });


    // MUTATION ADD

    const resMut = http.post('https://api.github.com/graphql', JSON.stringify({ query: mutation }), { headers: headers })
    // console.log('response mutation', JSON.stringify(resMut.body));
    check(resMut,
        {
            "status code after adding a new comment is": () => resMut.status === 200,
            "mutation response contains subject id": () => JSON.parse(resMut.body).data.addComment.subject.id === issueID,
        });



    // MUTATION DELETE

    const resDel = http.post('https://api.github.com/graphql', JSON.stringify({ query: deleteMut, variables: { id: commentID } }), { headers: headers })
    console.log('comment id', commentID);
    check( resDel,
        {
            "status code after deleting comment is 200" : () => resDel.status === 200,
        }

    )
}