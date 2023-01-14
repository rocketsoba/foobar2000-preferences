// ==PREPROCESSOR==
// @name "Buttons"
// @author "rockyakisoba"
// @import "%fb2k_path%js\Flags.txt"
// @import "%fb2k_path%js\Helpers.txt"
// @import "%fb2k_path%js\Button.js"
// ==/PREPROCESSOR==


// Buttons class
function Buttons(base_x, base_y) {
    this.base_x = base_x;
    this.base_y = base_y;
    this.button_list = [];
    this.cursor = IDC_HAND;

    this.add = function(button) {
        this.button_list.push(button);
    }

    this.is_on_mouse = function(button, x, y) {
        if (
            x > button.w_offset + this.base_x &&
            x < button.w_offset + this.base_x + button.img_list[0].Width * button.scale &&
            y > button.h_offset + this.base_y &&
            y < button.h_offset + this.base_y + button.img_list[0].Height * button.scale
        ) {
            return true;
        } else {
            return false;
        }
    }

    this.is_buttons_on_mouse = function(x, y) {
        for (var i = 0; i < this.button_list.length; i++) {
            if (this.is_on_mouse(this.button_list[i], x, y)) {
                return true;
            }
        }
        return false;
    }

    this.paint = function(gr, info) {
        var button;
        var img_index;
        for (var i = 0; i < this.button_list.length; i++) {
            button = this.button_list[i];
            img_index = button.select_draw_img_func(info);
            gr.DrawImage(
                button.img_list[img_index],
                button.w_offset + this.base_x,
                button.h_offset + this.base_y,
                button.img_list[0].Width * button.scale,
                button.img_list[0].Height * button.scale,
                0,
                0,
                button.img_list[0].Width,
                button.img_list[0].Height
            );
        }
    }

    this.mouse_lbtn_down = function(x, y, info) {
        var status;
        for (var i = 0; i < this.button_list.length; i++) {
            if (this.is_on_mouse(this.button_list[i], x, y)) {
                status = this.button_list[i].click_func(info);
                if (typeof(status) == "undefined") {
                    status = info;
                }
                return info;
            }
        }
        return info;
    }

    this.mouse_move = function(x, y) {
        for (var i = 0; i < this.button_list.length; i++) {
            if (this.is_on_mouse(this.button_list[i], x, y)) {
                window.SetCursor(this.cursor);
            }
        }
    }
}
