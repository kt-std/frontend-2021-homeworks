let FRIENDS_ARRAY = [],
	INITIAL_FRIENDS_ARRAY = [];
const USERS_AMOUNT = 24,
	API_URL = `https://randomuser.me/api/?results=${USERS_AMOUNT}`,
	CARDS_CONTAINER = document.querySelector(".cards__container"),
	TOTAL_COUNTER = document.querySelector(".amount");

function getFriends() {
	fetch(API_URL)
		.then((response) => {
			if (checkResponseStatus(response.status)) {
				return response.json();
			} else {
				appendErrorMessage(
					getResponseErrorMessage(
						response.status,
						response.statusText
					)
				);
			}
		})
		.then((responseBody) => {
			if (responseBody !== undefined) {
				INITIAL_FRIENDS_ARRAY = INITIAL_FRIENDS_ARRAY.concat(
					flattenFriendProperties(responseBody.results)
				);
				FRIENDS_ARRAY = INITIAL_FRIENDS_ARRAY;
				appendFriendsCards(FRIENDS_ARRAY);
				setTotalCounter(FRIENDS_ARRAY);
				initializeAgeLimits(FRIENDS_ARRAY);
			}
		})
		.catch((error) =>
			appendErrorMessage(`${error} <br> Try to reload the page!`)
		);
}

getFriends();

function checkResponseStatus(status) {
	if (status >= 200 && status < 300) {
		return true;
	} else {
		return false;
	}
}

function setTotalCounter(friendsArray) {
	TOTAL_COUNTER.innerText = `${friendsArray.length} Totals`;
	if (!friendsArray.length) {
		appendNoResultsMessage();
	}
}

function initializeAgeLimits(friendsArray) {
	["minAge", "maxAge"].forEach((limitInputId) =>
		["min", "max"].forEach((limitType) =>
			setAgeLimit(
				getCertainAgeLimit(friendsArray, limitType),
				limitInputId,
				limitType
			)
		)
	);
}

function appendNoResultsMessage() {
	const noResultMessage = document.createElement("h3");
	noResultMessage.innerText = "Sorry! No results found :(";
	noResultMessage.classList.add("no-results");
	CARDS_CONTAINER.appendChild(noResultMessage);
}

function appendFriendsCards(friendsArray) {
	cleanCardsContainer();
	setTotalCounter(friendsArray);
	const fragment = document.createDocumentFragment();
	friendsArray.forEach((friend) => {
		const template = document.createElement("template");
		template.innerHTML = getFriendCardTemplate(friend);
		fragment.appendChild(template.content);
	});
	CARDS_CONTAINER.appendChild(fragment);
}

function appendErrorMessage(errorText) {
	const div = document.createElement("div"),
		img = document.createElement("img");
	div.innerHTML = errorText;
	div.classList.add("error__container");
	img.classList.add("error__image");
	img.src = "assets/error.svg";
	div.appendChild(img);
	document.querySelector(".main__row").style.display = "none";
	document.querySelector(".more__button").style.display = "none";
	document.body.append(div);
}

function cleanCardsContainer() {
	CARDS_CONTAINER.innerHTML = "";
}

function flattenFriendProperties(friendsArray) {
	return friendsArray.map((friend) => {
		return {
			firstName: friend.name.first,
			lastName: friend.name.last,
			email: friend.email,
			gender: friend.gender,
			country: friend.location.country,
			username: friend.login.username,
			phone: friend.phone,
			age: friend.dob.age,
			image: friend.picture.large,
			registeredAge: friend.registered.age,
			registeredDate: friend.registered.date,
		};
	});
}

function getFriendCardTemplate(friend) {
	return `<div class="card__container shadow">
				<div class="card__row around">
					<a href='mailto:${friend.email}' class="email__button button" 
					   data-title='${friend.email}'></a>
					<img src="${friend.image}" class="card__image">
					<a href='tel:${reformatPhoneNumber(friend.phone)}' class="phone__button button" 
					   data-title='${reformatPhoneNumber(friend.phone)}'></a>
				</div>
				<div class="card__row column">
					<h3 class="card__name">${friend.firstName} ${friend.lastName}</h3>
					<h5 class="card__username">@${friend.username}</h5>
				</div>
				<div class="card__row gender__container">
					<h6 class="card__gender">${getGenderIcon(friend.gender)}</h6>
					<h6 class="card__age">${friend.age}</h6>
				</div>
				<div class="card__row registered__container">
					<p class="registered__message">Friends since <br> 
					${getDate(friend.registeredDate)}</p>
					<div style="width:${friend.registredAge}%"></div>
				</div>
				<div class="card__row country__row">
					<h6 class="card__country">${friend.country}</h6>
				</div>
			</div>`;
}

function reformatPhoneNumber(number) {
	return number
		.replace(/[^0-9]+/g, "")
		.replace(/.(\d{3})/g, "$1-")
		.replace(/(^\d{3,3})-(.\d+)/, "+($1)-$2")
		.replace(/[-]+$/g, "");
}

function getDate(date) {
	return new Date(date).toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function getGenderIcon(gender) {
	return gender === "female"
		? '<span class="female">♀</span>'
		: '<span class="male">♂</span>';
}

function getResponseErrorMessage(status, statusText) {
	return `<h1 class='error__message'>Sorry, an error occured!</h1>
			<h2 class='error__code'>${status}: ${statusText}</h2>`;
}

function setAgeLimit(ageLimit, limitInputId, limitType) {
	const limitInput = document.getElementById(limitInputId);
	limitInput[limitType] = ageLimit;
	setInputLimitValue(
		limitInput,
		limitInputId,
		limitType,
		"minAge",
		"min",
		ageLimit
	);
	setInputLimitValue(
		limitInput,
		limitInputId,
		limitType,
		"maxAge",
		"max",
		ageLimit
	);
}

function setInputLimitValue(
	limitInput,
	limitInputId,
	limitType,
	limitInputIdValue,
	limitTypeValue,
	ageLimit
) {
	if (limitInputId === limitInputIdValue && limitType === limitTypeValue)
		limitInput.value = ageLimit;
}

function getCertainAgeLimit(friendsArray, value) {
	const sortedArray = friendsArray.sort((a, b) => a.age - b.age);
	return value === "min"
		? sortedArray[0].age
		: sortedArray[sortedArray.length - 1].age;
}

function sortCards(e, friendsArray) {
	if (e.target.classList.contains("list__item")) {
		document.querySelector(".select__face-item").innerText =
			e.target.textContent;
		sortCardsArray(e.target.attributes.value.value, friendsArray);
	}
}

function sortCardsArray(condition, friendsArray) {
	switch (condition) {
		case "ND":
			FRIENDS_ARRAY.sort((a, b) => b.firstName.localeCompare(a.firstName));
			break;
		case "NA":
			FRIENDS_ARRAY.sort((a, b) => a.firstName.localeCompare(b.firstName));
			break;
		case "AD":
			FRIENDS_ARRAY.sort((a, b) => b.age - a.age);
			break;
		case "AA":
			FRIENDS_ARRAY.sort((a, b) => a.age - b.age);
			break;
	}
}

function findSubstring(string, substring) {
	return string.toLowerCase().indexOf(substring.toLowerCase()) >= 0
		? true
		: false;
}

function findMatchesWithPropertiesValues(
	propertiesList,
	friendsArray,
	substring
) {
	return friendsArray.filter((friend) => {
		return propertiesList
			.map((property) => findSubstring(friend[property], substring))
			.some((el) => el);
	});
}

function filterByGenderValue(genderList, friendsArray) {
	return friendsArray.filter((friend) =>
		genderList.some((gender) => friend.gender === gender.value)
	);
}

function filterByAgeLimits(minAge, maxAge, friendsArray) {
	return friendsArray.filter(
		(friend) => friend.age >= minAge && friend.age <= maxAge
	);
}

function filterByGender(e, friendsArray) {
	let checkboxes = document.querySelectorAll("input[type=checkbox]");
	checkboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);
	return filterByGenderValue(checkboxes, friendsArray);
}

function filterByAge(friendsArray) {
	const min = document.getElementById("minAge"),
		max = document.getElementById("maxAge");
	if (min.value && max.value) {
		return filterByAgeLimits(min.value, max.value, friendsArray);
	}
}

checkFiltersChanged = (event) =>
	["list__item", "number", "checkbox"].some(
		(filter) => event.target.className === filter
	);

function updateCards(event) {
	if (checkFiltersChanged(event)) {
		FRIENDS_ARRAY = INITIAL_FRIENDS_ARRAY;
		sortCards(event, FRIENDS_ARRAY);
		FRIENDS_ARRAY = filterByAge(FRIENDS_ARRAY);
		FRIENDS_ARRAY = filterByGender(event, FRIENDS_ARRAY);
		appendFriendsCards(FRIENDS_ARRAY);
	}
}

document.querySelector("#showFiltersButton").addEventListener("click", (e) => {
	const filtersContainer = document.querySelector(".filters__container");
	filtersContainer.classList.toggle("display");
	Array.from(filtersContainer.children).forEach((node) => {
		node.classList.toggle("visible");
	});
});

document.querySelector("#sort").addEventListener("click", (e) => {
	document.querySelector(".select__list").classList.toggle("visible");
});

document.querySelector("#search").addEventListener("input", (e) => {
	const inputString = e.target.value,
		filteredArray = findMatchesWithPropertiesValues(
			["firstName", "lastName", "email", "username", "country"],
			FRIENDS_ARRAY,
			inputString
		);
	appendFriendsCards(filteredArray);
});

document.querySelector(".filters__container").addEventListener("click", (event) => {
		updateCards(event);
	});

document.querySelectorAll(".number").forEach((ageInput) => {
	ageInput.addEventListener("change", (event) => {
		updateCards(event);
	});
});

window.addEventListener("beforeunload", () => {
	["#search", "#minAge", "#maxAge"].forEach(
		(element) => (document.querySelector(element).value = "")
	);
	document.querySelector("#female").checked = "true";
	document.querySelector("#male").checked = "true";
});
