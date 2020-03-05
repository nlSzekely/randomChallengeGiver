
//Displaying a motivational quote in get challenges panel at start
function getRandomQuote() {
    const filteredQuotes = quotes.filter((item) => {
        return item.text.length <= 80 && item.from.length <= 50 && !item.from.toLowerCase().includes('jay');
    })
    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    document.querySelector('#display-challenge').innerHTML = `
    <blockquote class="blockquote text-center">
      <p class="mb-0">${randomQuote.text}</p>
      <footer class="blockquote-footer"><cite title="Source Title">${randomQuote.from}</cite></footer>
    </blockquote>
    `;
}

getRandomQuote();

//---------------------------------------------------------------
//Getting the data from localstorage----------------------------
let data = JSON.parse(localStorage.getItem("challenges2")) ||
{
    totalCompleted: 0,
    recentlyCompleted: [
        {
            name: "Sometimes later becomes never. Do it now.",
            date: getDate()
        },
        {
            name: "Dream it. Wish it. Do it",
            date: getDate()
        },
        {
            name: "Your limitation—it’s only your imagination",
            date: getDate()
        },
    ],
    challenges: [],
    lastPickedId: null
};

let base = [...data.challenges]

let challenges = data.challenges;
let totalCompleted = data.totalCompleted;
let recentlyCompleted = data.recentlyCompleted;
//------------------------------------------------------------
render();


//1.Add challenge
function addChallenge(e) {
    e.preventDefault();
    const challengeName = document.querySelector('#add-challenge').value;
    if (!challengeName) { return };
    this.reset();
    challenges.push({
        id: uuidv4(),
        name: challengeName,
        completed: 0,
    });
    saveData();
    document.querySelector('#search-input').value = "";
    render();
    getRandomQuote();
    const getChallengeButton = document.querySelector('#get-challenge');
    getChallengeButton.classList.remove('disabled');
}

document.querySelector("#add-challenge-form").addEventListener('submit', addChallenge);


//Render
function render() {
    const searchInput = document.querySelector('#search-input').value;
    const filtered = challenges.filter((item) => {
        return item.name.toLowerCase().includes(searchInput.toLowerCase());
    })
    const filteredHtml = filtered.map((item) => {
        return `
        <div id="${item.id}" class="ui card" style="width:100%">
            <div class="content">
                <div class="description">
                    <p data-edit="${item.id}">${item.name}</p>
                </div>
            </div>
            <div class="extra content">
                <i class="sync icon"></i>
                ${item.completed} Completion
                <i data-name="${item.name}"data-id="${item.id}" id="edit" class="pencil icon" style="float: right; cursor: pointer;"></i>
                <i data-name="${item.name}"data-id="${item.id}" id="delete" class="trash icon" style="float: right; cursor: pointer;"></i>
            </div>
        </div>
        `;
    }).join("");
    document.querySelector("#challenge-list").innerHTML = filteredHtml;

    //adding event listeners to trash icon after rendering the content
    document.querySelectorAll('#delete').forEach((item) => {
        item.addEventListener('click', deleteChallenge);
    });

    //adding event listeners to pencil icon after rendering the content
    document.querySelectorAll('#edit').forEach((item) => {
        item.addEventListener('click', addContentEditable);
    });

    document.querySelectorAll('[data-edit]').forEach((item) => {
        item.addEventListener('keydown', (e) => {
            if (e.keyCode === 13) {
                e.target.blur();
            }
        });
        item.addEventListener('blur', editChallenge);
    });

    document.querySelector('#total-completed').textContent = data.totalCompleted;
    //rendering recently completed list
    const recentlyDOM = document.querySelector('#recently-completed');
    recentlyDOM.innerHTML = recentlyCompleted.map((item) => {
        return `
        <div class="content">
            <div class="summary">
                <a>${item.name}</a>
                <span class="right floated">
                    <i class="calendar check outline icon"></i>${item.date}
                </span>
            </div>
        </div>
        <hr>
        `;
    }).join("");

}

document.querySelector('#challenge-search').addEventListener('keyup', render);


//get date function
function getDate() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();
    if (month < 10) {
        month = `0${month}`;
    }
    if (day < 10) {
        day = `0${day}`;
    }
    return `${year}.${month}.${day}`;
}

//delete challenge

function deleteChallenge(e) {
    if (confirm(`Delete: "${this.dataset.name}"?`)) {
        const id = this.dataset.id;
        const index = challenges.findIndex((item) => {
            return item.id === id;
        })
        challenges.splice(index, 1);
        saveData();
        render();
    };
}

//setting contenteditable attribute true and focus when pencil icon clicked
function addContentEditable() {
    const edit = document.querySelector(`[data-edit="${this.dataset.id}"]`);
    //toggle attribute contenteditable
    edit.setAttribute('contenteditable', true);
    edit.focus();
}

//edit challenge
function editChallenge(e) {
    const editedName = e.target.textContent;
    const id = e.target.dataset.edit;
    const index = challenges.findIndex((item) => {
        return item.id === id;
    })
    challenges[index].name = editedName;
    saveData()
}


//give challenge

document.querySelector('#get-challenge').addEventListener('click', getChallenge);

function getChallenge() {
    let picked;
    if (challenges.length > 1) {
        if (!data.lastPickedId) {
            let random = Math.floor(Math.random() * challenges.length);
            picked = challenges[random];
            data.lastPickedId = picked.id;
            saveData();
        } else {
            let filtered = challenges.filter((item) => {
                return item.id !== data.lastPickedId;
            })
            let random = Math.floor(Math.random() * filtered.length);
            picked = filtered[random];
            data.lastPickedId = picked.id;
            saveData();
        }

    } else if (challenges.length === 1) {
        picked = challenges[0];
    } else {
        picked = { name: "Adding some challenges to my list.." };
    }

    document.querySelector('#display-challenge').innerHTML = ` 
    <p> <strong>Current Challenge: </strong></p>  
    <p>${picked.name}</p> 
    <p><i id="check" data-id="${picked.id}" data-value="1" class="calendar big check outline icon  button"></i><i id="check" data-value="0" class="calendar  big times outline icon "></i> </p> 
    `;
    const check = document.querySelectorAll('#check');
    check.forEach((item) => {
        item.addEventListener('click', checkChallenge);
    })
    const getChallengeButton = document.querySelector('#get-challenge');
    getChallengeButton.classList.add('disabled');
}

//save data 
function saveData() {
    localStorage.setItem("challenges2", JSON.stringify(data));
}

//chacking and unchecking challenges

function checkChallenge(e) {
    if (e.target.dataset.value == 0) {
        getRandomQuote()
        const getChallengeButton = document.querySelector('#get-challenge');
        getChallengeButton.classList.remove('disabled');
    } else {
        if (e.target.dataset.id === "undefined") {
            alert("Dont lie to me!");
            const getChallengeButton = document.querySelector('#get-challenge');
            getChallengeButton.classList.remove('disabled');
            return;
        }
        data.totalCompleted += 1;
        const getChallengeButton = document.querySelector('#get-challenge');
        getChallengeButton.classList.remove('disabled');
        const index = challenges.findIndex((item) => {
            return item.id === e.target.dataset.id;
        })
        data.challenges[index].completed += 1;
        data.recentlyCompleted.unshift(
            {
                name: data.challenges[index].name,
                date: getDate()
            }
        );
        data.recentlyCompleted.pop();
        saveData();
        render();
        getRandomQuote()
    };
}




// deleting all the data with a keyword

function resetAllData() {
    const secretWord = "deleteall";
    const myArr = [];
    document.addEventListener('keydown', getKey);
    function getKey(e) {
        if (myArr.length >= secretWord.length) {
            myArr.shift();
            myArr.push(e.key);
        } else {
            myArr.push(e.key)
        }
        if (myArr.join("").toLowerCase().includes(secretWord)) {
            if (confirm("Delete all challenge data?")) {
                localStorage.removeItem('challenges2');
                location.reload();
            } else {
                return;
            }
        }
    }

}

resetAllData();