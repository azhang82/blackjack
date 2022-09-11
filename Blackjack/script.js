
//Blackjack

//Variables

let CardDeck = [];
let RemovedCards = [];
let PlayerCards = [];
let DealerCards = [];
var PlayerMoney = 100;
var BetSet = false;
var PlayerTurn = false;
let Bet = 0;
var Blackjack = false;
var isDealerTurn = false;
var end = false;

const Cards = [
  ["", "cards/ace_of_spades.png", "cards/2_of_spades.png", "cards/3_of_spades.png", "cards/4_of_spades.png", "cards/5_of_spades.png", "cards/6_of_spades.png", "cards/7_of_spades.png", "cards/8_of_spades.png", "cards/9_of_spades.png", "cards/10_of_spades.png", "cards/jack_of_spades.png", "cards/queen_of_spades.png", "cards/king_of_spades.png"],
  ["", "cards/ace_of_hearts.png", "cards/2_of_hearts.png", "cards/3_of_hearts.png", "cards/4_of_hearts.png", "cards/5_of_hearts.png", "cards/6_of_hearts.png", "cards/7_of_hearts.png", "cards/8_of_hearts.png", "cards/9_of_hearts.png", "cards/10_of_hearts.png", "cards/jack_of_hearts.png", "cards/queen_of_hearts.png", "cards/king_of_hearts.png"],
  ["", "cards/ace_of_diamonds.png", "cards/2_of_diamonds.png", "cards/3_of_diamonds.png", "cards/4_of_diamonds.png", "cards/5_of_diamonds.png", "cards/6_of_diamonds.png", "cards/7_of_diamonds.png", "cards/8_of_diamonds.png", "cards/9_of_diamonds.png", "cards/10_of_diamonds.png", "cards/jack_of_diamonds.png", "cards/queen_of_diamonds.png", "cards/king_of_diamonds.png"],
  ["", "cards/ace_of_clubs.png", "cards/2_of_clubs.png", "cards/3_of_clubs.png", "cards/4_of_clubs.png", "cards/5_of_clubs.png", "cards/6_of_clubs.png", "cards/7_of_clubs.png", "cards/8_of_clubs.png", "cards/9_of_clubs.png", "cards/10_of_clubs.png", "cards/jack_of_clubs.png", "cards/queen_of_clubs.png", "cards/king_of_clubs.png"]
]; // access by Cards[suit][num]

class Card {
  constructor(number, suit, image) {
    this.number = number;
    this.suit = suit;
    this.image = image;
  }
}

//Creation Programs

function CreateDeck(deck) {
  for (var number = 1; number <= 13; number++) {
    for (var suit = 0; suit < 4; suit++) {
      let NewCard = new Card(number, suit);
      deck.push(NewCard);
    }
  }
  return deck;
}

function ShuffleDeck(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function DealCard(deck, cardlist, name, visible) {
  let DealtCard = deck.shift();
  RemovedCards.push(DealtCard);
  cardlist.push(DealtCard);
  var img = document.createElement("img");
  if (visible) {
    img.src = Cards[DealtCard.suit][DealtCard.number];
  }
  else {
    img.src = "cards/card_back1.png";
  }
  var content = document.getElementById(name + "-content");
  content.appendChild(img);
}

function FlipCard(card, cardList) {
  var index = cardList.indexOf(card) + 1;
  var children = document.getElementById("dealer-content").children;
  for (let i = 0; i < children.length; ++i) {
    if (i == index) {
      children[i].src = Cards[card.suit][card.number];
    }
  }
}

//Player Programs

function SetBet() {
  if (!BetSet && !end) {
    //Get the elements inside the text with id bet-input
    var BetString = document.getElementById("bet-input").value;

    //Change the string into a number
    Bet = parseInt(BetString);

    //Don't let the player bet if they don't have enough money
    if (isNaN(Bet) || PlayerMoney - Bet < 0 || Bet == 0) {
      return;
    }
    //Subtract from the player's money
    PlayerMoney -= Bet;
    UpdateHtmlMoney(PlayerMoney)

    //Game start
    CardDeck = CreateDeck(CardDeck);
    CardDeck = ShuffleDeck(CardDeck);
    DealCard(CardDeck, PlayerCards, "player", true);
    DealCard(CardDeck, DealerCards, "dealer", true);
    DealCard(CardDeck, PlayerCards, "player", true);
    DealCard(CardDeck, DealerCards, "dealer", false);
    CheckBlackjack(PlayerCards);

    ChangeAce(PlayerCards);
    let sum = FindSum(PlayerCards);
    UpdateHtmlPlayerValue(sum);
    PlayerTurn = true;
  }
  BetSet = true;
}

function PlayerHit(deck, cardlist) {
  if (!PlayerTurn && !end) return;

  DealCard(CardDeck, PlayerCards, "player", true);

  ChangeAce(PlayerCards);
  let sum = FindSum(PlayerCards);
  UpdateHtmlPlayerValue(sum);
  if (CheckBust(PlayerCards)) GameLost();
}

function DoubleDown() {
  if (!PlayerTurn || end || PlayerMoney < Bet) return;
  PlayerMoney = PlayerMoney - Bet;
  UpdateHtmlMoney(PlayerMoney);
  Bet = Bet * 2;
  PlayerHit();
  Stand();
}

function Stand() {
  if (PlayerTurn && !end) {
    isDealerTurn = true;
    PlayerTurn = false;
    DealerTurn(CardDeck, DealerCards);
  }
}

//Dealer Programs

function DealerTurn(cardlist) {
  if (isDealerTurn == false) return;

  let card = DealerCards[1];
  FlipCard(card, DealerCards);

  ChangeAce(cardlist);
  let sum = FindSum(DealerCards);
  UpdateHtmlDealerValue(sum);

  while (FindSum(DealerCards) < 17) {
    DealerHit(CardDeck, DealerCards);
    ChangeAce(DealerCards);
  }

  isDealerTurn = false;
  FindWinner();
}

function DealerHit(deck, cardlist) {

  DealCard(CardDeck, DealerCards, "dealer", true);

  ChangeAce(cardlist);
  let sum = FindSum(DealerCards);
  UpdateHtmlDealerValue(sum);
}

//Checking Programs

function CheckBlackjack(cards) {
  let card1 = cards[0];
  let card2 = cards[1];
  if ((card1.number == 1 && (card2.number == 10 || card2.number == 11 || card2.number == 12 || card2.number == 13))) {
    Blackjack = true;
    GameWon();
  }
  if ((card2.number == 1 && (card1.number == 10 || card1.number == 11 || card1.number == 12 || card1.number == 13))) {
    Blackjack = true;
    GameWon();
  }
}

function CheckBust(cardlist) {
  ChangeAce(cardlist);
  let sum = FindSum(cardlist);
  if (sum > 21) return true;
  else return false;
}

function FindSum(cardlist) {
  let sum = 0;
  for (var i = 0; i < cardlist.length; i++) {
    if (cardlist[i].number > 10 && cardlist[i].number != 14) sum += 10;
    if (cardlist[i].number == 14) sum += 11;
    if (cardlist[i].number < 11) sum += cardlist[i].number;
  }
  return sum;
}

function ChangeAce(cardlist) {
  for (var i = 0; i < cardlist.length; i++) {
    if (cardlist[i].number == 1 && FindSum(cardlist) + 10 <= 21) cardlist[i].number = 14;
    if (cardlist[i].number == 14 && FindSum(cardlist) > 21) cardlist[i].number = 1;
  }
}

//Result Programs

function GameLost() {
  if (end) return;
  PlayerTurn = false;
  BetSet = false;

  let card = DealerCards[1];
  FlipCard(card, DealerCards);

  document.getElementById("message-box").style.color = "red";
  UpdatePlayerMessage("You lost!");
  
  end = true;
}

function GameTie() {
  if (end) return;
  PlayerTurn = false;
  BetSet = false;

  document.getElementById("message-box").style.color = "black";
  UpdatePlayerMessage("You tied!");
  
  PlayerMoney = PlayerMoney + Bet;
  UpdateHtmlMoney(PlayerMoney);
  end = true;
}

function GameWon() {
  if (end) return;
  PlayerTurn = false;
  BetSet = false;

  let card = DealerCards[1];
  FlipCard(card, DealerCards);
  
  document.getElementById("message-box").style.color = "green";
  UpdatePlayerMessage("You won!");
  
  if (Blackjack) PlayerMoney = PlayerMoney + 2.5 * Bet;
  else PlayerMoney = PlayerMoney + 2 * Bet;
  UpdateHtmlMoney(PlayerMoney);
  end = true;
}

function FindWinner() {
  ChangeAce(PlayerCards);
  let player = FindSum(PlayerCards);
  ChangeAce(DealerCards);
  let dealer = FindSum(DealerCards);

  if (player > dealer && !CheckBust(PlayerCards)) GameWon();
  if (CheckBust(DealerCards) && !CheckBust(PlayerCards)) GameWon();
  if (player == dealer && !CheckBust(PlayerCards) && !CheckBust(DealerCards)) GameTie();
  GameLost();
}

//Reset Programs 

function ClearArray(array) {
  for (var i = 0; i < array.length; i++) {
    array.splice(i);
  }
}

function ResetBoard() {
  if (!end) return;
  end = false;
  for (var i = 0; i < RemovedCards.length; i++) {
    CardDeck.push(RemovedCards[i]);
  }
  var dealerHtml = document.getElementById("dealer-content");
  for (let i = 0; i < dealerHtml.children.length; ++i) {
    var child = dealerHtml.children[i];
    if (child.nodeName == "IMG") {
      dealerHtml.removeChild(child);
      --i;
    }
  }
  offset = 0;
  var playerHtml = document.getElementById("player-content");
  for (let i = 0; i < playerHtml.children.length; ++i) {
    var child = playerHtml.children[i];
    if (child.nodeName == "IMG") {
      playerHtml.removeChild(child);
      --i;
    }
  }
  
  isDealerTurn = false;
  document.getElementById('bet-input').value = "";
  document.getElementById("message-box").style.display = "none";

  ClearArray(PlayerCards);
  ClearArray(DealerCards);
  UpdateHtmlPlayerValue("--");
  UpdateHtmlDealerValue("--");
  
  if(PlayerMoney == 0) 
  {
    document.getElementById("message-box").style.color = "red";
    UpdatePlayerMessage("You are bankrupt! Reload to play again");
  }
}

//Update HTML Programs

function UpdateHtmlMoney(newValue) {
  document.getElementById("player-money").innerHTML = "$" + newValue.toString();
}

function UpdateHtmlDealerValue(newValue) {
  document.getElementById("dealer-value").innerHTML = newValue.toString();
}

function UpdateHtmlPlayerValue(newValue) {
  document.getElementById("player-value").innerHTML = newValue.toString();
}

function UpdatePlayerMessage(newValue) {
  document.getElementById("message-box").style.display = "inline-block";
  document.getElementById("message-box").innerHTML = newValue.toString();
}