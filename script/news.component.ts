import { Component } from "@angular/core";

@Component({
    selector: "news",
    template: `
<p>Hello everyone!!</p>

<p>After 5 months of almost full-time work, today I'm releasing the first version of my this website.</p>

<p>So far this website contains 4 tools/games to help you improve in Dota 2:</p>

<ul>
<li><p>A mouse accuracy trainer for you to reduce your misclicks and increase your reaction speed.</p></li>

<li><p>An ability trainer for you to polish and improve your knowledge about mana costs and cooldowns of all the abilities in Dota 2.</p></li>

<li><p>An item trainer, basically like shopkeeper's quiz - to improve your knowledge about how to build items</p></li>

<li><p>An invoker trainer for you to learn and practice how to quickly invoke abilities as Invoker.</p></li>
</ul>

<p>This however is just the very beginning of this website. I have quite big plans and a lot of ideas on things that I want to add to this website. And I want to implement as many community suggestions as possible!</p>

<p>Anyway, please have fun on my website!!</p>

<p>Known Issues:</p>

<ul>
<li><p>The graph that tracks your progress has some minor glitches in Firefox</p></li>

<li><p>There seems to be a major performance issue with regards to the animations on mobile. I can fix it, but it would take a while, so please tell me if you think I should make it a priority or prioritize other things.</p></li>
</ul>
`
})
export class NewsComponent {

}