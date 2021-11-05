const savedWords = document.getElementById('saved_words');
const wordInput = document.getElementById('word_input');
const showRhymesButton = document.getElementById('show_rhymes');
const showSynonymsButton = document.getElementById('show_synonyms');
const outputDescription = document.getElementById('output_description');
const wordOutput = document.getElementById('word_output');
const saved = [];

showRhymesButton.addEventListener('click', () => {
    const input = wordInput.value;
    outputDescription.innerHTML = `Words that rhyme with ${input}:`;
    wordOutput.innerHTML = '...loading';
    getRhymes(input, (data) => {
        displayRhymes(data);
    });
});

showSynonymsButton.addEventListener('click', () => {
    const input = wordInput.value;
    outputDescription.innerHTML = `Words with a meaning similar to ${input}:`;
    wordOutput.innerHTML = '...loading';
    getSynonyms(input, (data) => {
        displaySynonyms(data);
    });

});

function getRhymes(rel_rhy, callback) {
    fetch(`https://api.datamuse.com/words?${(new URLSearchParams({rel_rhy})).toString()}`)
        .then((response) => response.json())
        .then((data) => {
            callback(data);
        }, (err) => {
            console.error(err);
        });
}
function getSynonyms(ml, callback) {
    fetch(`https://api.datamuse.com/words?${(new URLSearchParams({ml})).toString()}`)
        .then((response) => response.json())
        .then((data) => {
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

function handleSave(word) {
    if(!saved.includes(word)) {
        saved.push(word);
        savedWords.textContent = saved.join(', ');
    }
};

function displayRhymes(data) {
    wordOutput.innerHTML = '';
    if(data.length) {
        const groups = groupBy(data, 'numSyllables');
        for (const key in groups) {
            const groupName = document.createElement('h3');
            groupName.textContent = `${key} syllable${addS(parseInt(key))}:`;
            wordOutput.append(groupName);
            const itemList = document.createElement('ul');
            const group = groups[key];
            for (const i in group) {
                const item = document.createElement('li');
                item.textContent = group[i].word;
                const saveButton = document.createElement('button');
                saveButton.classList.add('btn', 'btn-outline-success');
                saveButton.textContent = '(save)';
                saveButton.addEventListener('click', handleSave.bind(this, group[i].word));
                item.append(saveButton);
                itemList.append(item);
            }
            wordOutput.append(itemList);
        }
    }
    else{
        wordOutput.innerHTML = '(no results)';
    }
}

function displaySynonyms(data) {
    wordOutput.innerHTML = '';
    if(data.length) {
        const itemList = document.createElement('ul');
        for (const key in data) {
            const item = document.createElement('li');
            item.textContent = data[key].word;
            const saveButton = document.createElement('button');
            saveButton.classList.add('btn', 'btn-outline-success');
            saveButton.textContent = '(save)';
            saveButton.addEventListener('click', handleSave.bind(this, data[key].word));
            item.append(saveButton);
            itemList.append(item);
        }
        wordOutput.append(itemList);
    }
    else{
        wordOutput.innerHTML = '(no results)';
    }
}

function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

function addS(num) {
    return num === 1 ? '' : 's';
}