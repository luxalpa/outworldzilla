import { Pipe, PipeTransform } from "@angular/core";

const keyMap = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: "Ctrl",
    18: "Alt",
    19: "Break",
    27: 'Escape',
    32: 'Space',
    36: 'Home',
    33: 'Page Up',
    34: 'Page Down',
    35: 'End',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    45: "Insert",
    46: 'Delete',
    91: 'Windows',
    106: "Num *",
    107: "Num +",
    109: "Num -",
    111: "Num /",
    144: "Num Lock",
    145: "Scroll",
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: "/",
    192: '`',
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
};


@Pipe({
    name: "keyboardkey"
})
export class KeyboardKeyPipe implements PipeTransform {
    transform(key) {
        return keyMap[key] || String.fromCharCode((96 <= key && key <= 105)? key-48 : key);
    }
}