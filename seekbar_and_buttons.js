// ==PREPROCESSOR==
// @name "seekbar and buttons"
// @author "rockyakisoba"
// @import "%fb2k_path%js\Flags.txt"
// @import "%fb2k_path%js\Helpers.txt"
// @import "%fb2k_path%js\Buttons.js"
// ==/PREPROCESSOR==


var text_font = gdi.Font("メイリオ", 13, 0);
var text_color = RGB(255, 255, 255);
var y_position_ratio = 0.8;
var background_color = RGB(46, 48, 63);
var bar_color = RGB(106, 106, 106);
var bar_played_color = RGB(46, 161, 229);
var bar_height = 5;
var bar_w_offset = 7;
var bar_end_padding = 500;
var default_cursor = IDC_ARROW;
var knob = {
    src: gdi.Image(fb.FoobarPath + "icon/seekbar_knob.png"),
    scale: 0.6,
    w_offset: - 16,
    h_offset: 0,
};
var play = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/play.png"),
    ],
    scale: 0.25,
    w_offset: -30,
    h_offset: 20,
    click_func: function() {
        fb.PlayOrPause();
    },
    select_draw_img_func: function() {
        return 0;
    },
};
var next = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/next.png"),
    ],
    scale: 0.25,
    w_offset: 60,
    h_offset: 20,
    click_func: function() {
        fb.Next();
    },
    select_draw_img_func: function() {
        return 0;
    },
};
var previous = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/previous.png"),
    ],
    scale: 0.25,
    w_offset: -130,
    h_offset: 20,
    click_func: function() {
        fb.Prev();
    },
    select_draw_img_func: function() {
        return 0;
    },
};
var random = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/random.png"),
        gdi.Image(fb.FoobarPath + "icon/random_transparent.png"),
    ],
    scale: 0.25,
    w_offset: -220,
    h_offset: 20,
    click_func: function() {
        if (fb.PlaybackOrder == 4) {
            fb.PlaybackOrder = 0;
        } else {
            fb.PlaybackOrder = 4;
        }
    },
    select_draw_img_func: function() {
        if (fb.PlaybackOrder == 4) {
            return 0;
        } else {
            return 1;
        }
    },
};
var repeat = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/repeat.png"),
        gdi.Image(fb.FoobarPath + "icon/repeat_transparent.png"),
    ],
    scale: 0.25,
    w_offset: 140,
    h_offset: 20,
    click_func: function() {
        if (fb.PlaybackOrder == 2) {
            fb.PlaybackOrder = 0;
        } else {
            fb.PlaybackOrder = 2;
        }
    },
    select_draw_img_func: function() {
        if (fb.PlaybackOrder == 2) {
            return 0;
        } else {
            return 1;
        }
    },
};
var speed15 = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/x1.5.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.5_transparent.png"),
    ],
    scale: 0.3,
    w_offset: 210,
    h_offset: 18,
    click_func: function(info) {
        if (info.speed != 1.5) {
            info.speed = 1.5;
            info.seek_time = fb.PlaybackTime;
            info.seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Speed x1.5");
            fb.Stop();
            fb.Play();
        } else {
            info.speed = 1.0;
            info.seek_time = fb.PlaybackTime;
            info.seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
            fb.Stop();
            fb.Play();
        }
        return info;
    },
    select_draw_img_func: function(info) {
        if (info.speed != 1.5) {
            return 1;
        } else {
            return 0;
        }
    },
};
var speed05 = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/x0.5.png"),
        gdi.Image(fb.FoobarPath + "icon/x0.5_transparent.png"),
    ],
    scale: 0.3,
    w_offset: -300,
    h_offset: 18,
    click_func: function(info) {
        if (info.speed != 0.5) {
            info.speed = 0.5;
            info.seek_time = fb.PlaybackTime;
            info.seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Speed x0.5");
            fb.Stop();
            fb.Play();
        } else {
            info.speed = 1.0;
            info.seek_time = fb.PlaybackTime;
            info.seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
            fb.Stop();
            fb.Play();
        }
        return info;
    },
    select_draw_img_func: function(info) {
        if (info.speed != 0.5) {
            return 1;
        } else {
            return 0;
        }
    },
};
var volume = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/volume.png"),
    ],
    scale: 0.2,
    w_offset: -50,
    h_offset: -22,
    click_func: function(info) {
        if (fb.Volume != -100) {
            info.prev_volume = fb.Volume;
            fb.Volume = -100;
        } else {
            fb.Volume = info.prev_volume;
        }
        return info;
    },
    select_draw_img_func: function(info) {
        return 0;
    },
};

var center_buttons;
var right_buttons;
var info = {
    speed: 1.0,
    seek_flag: false,
    seek_time: 0,
    prev_volume: 0,
};
var center_w;
var center_h;
var right_w;
var ww = 0;
var wh = 0;
var g_pos = 0;
var g_drag = false;
var g_length = 1;


function on_size() {
    ww = window.Width;
    wh = window.Height;
    center_w = ww / 2;
    center_h = wh / 2;
    right_w = ww * 2 / 3 + ww * 1 / 9;

    center_buttons = new Buttons(center_w, 0);
    center_buttons.add(play);
    center_buttons.add(next);
    center_buttons.add(previous);
    center_buttons.add(random);
    center_buttons.add(repeat);
    center_buttons.add(speed15);
    center_buttons.add(speed05);

    right_buttons = new Buttons(right_w, center_h);
    right_buttons.add(volume);
}

function on_paint(gr) {
    window.MaxHeight = 120;
    center_height = wh * y_position_ratio;

    gr.FillSolidRect(0, 0, ww, wh, background_color);

    gr.FillSolidRect(bar_end_padding, center_height, ww - bar_end_padding * 2, bar_height, bar_color);
    gr.FillSolidRect(bar_end_padding, center_height, g_pos + knob.w_offset, bar_height, bar_played_color);
    gr.DrawImage(knob.src, g_pos + knob.w_offset + bar_end_padding, center_height - bar_w_offset, knob.src.Width * knob.scale, knob.src.Height * knob.scale, 0, 0, knob.src.Width, knob.src.Height);
    gr.DrawString(format_length(fb.PlaybackLength), text_font, text_color , ww - bar_end_padding + 10, center_height - 8, ww, wh);
    gr.DrawString(format_length(fb.PlaybackTime), text_font, text_color , bar_end_padding - 50, center_height - 8, ww, wh);

    gr.FillSolidRect(ww - bar_end_padding + bar_end_padding * 1 / 3, wh / 2, bar_end_padding * 1 / 3, bar_height, bar_color);
    gr.FillSolidRect(ww - bar_end_padding + bar_end_padding * 1 / 3, wh / 2, vol2pos(fb.Volume) * 100 / 100 * bar_end_padding * 1 / 3, bar_height, bar_played_color);

    center_buttons.paint(gr, info);
    right_buttons.paint(gr, info);
}

function on_mouse_lbtn_down(x, y) {
    if (center_buttons.is_buttons_on_mouse(x, y)) {
        info = center_buttons.mouse_lbtn_down(x, y, info);
    } else if (right_buttons.is_buttons_on_mouse(x, y)) {
        right_buttons.mouse_lbtn_down(x, y, info);
    } else {
        if (g_length > 0) {
            g_drag = true;
            on_mouse_move(x, y);
        }
    }
}

function on_mouse_lbtn_up(x, y) {
    if (
        g_length > 0 &&
        g_drag &&
        x > bar_end_padding &&
        x < ww - bar_end_padding
    ) {
        fb.PlaybackTime = g_length * g_pos / (ww - bar_end_padding * 2);
        on_mouse_move(x, y);
    }
    if (
        g_drag &&
        x > ww - bar_end_padding + bar_end_padding * 1 / 3 &&
        x < ww - bar_end_padding + bar_end_padding * 2 / 3
    ) {
        fb.Volume = pos2vol((x - (ww - bar_end_padding + bar_end_padding * 1 / 3)) / (bar_end_padding * 1 / 3));
    }
    g_drag = false;
}

function on_mouse_move(x, y) {
    if (center_buttons.is_buttons_on_mouse(x, y)) {
        center_buttons.mouse_move(x, y);
    } else if (right_buttons.is_buttons_on_mouse(x, y)) {
        right_buttons.mouse_move(x, y);
    } else {
        window.SetCursor(default_cursor);
    }

    if (
        g_drag &&
        x > bar_end_padding &&
        x < ww - bar_end_padding
    ) {
        g_pos = x - bar_end_padding;
        window.Repaint();
    }
}

function on_playback_seek() {
    if (!g_drag && g_length > 0) window.Repaint();
}

function on_playback_pause() {
    window.Repaint();
}

function on_playback_stop() {
    g_length = 0;
    g_pos = 0;
    g_drag = false;
    window.Repaint();
}

function on_playback_new_track() {
    g_length = fb.PlaybackLength;
    g_pos = 0;
    g_drag = false;
    window.Repaint();
}

// function on_mouse_wheel(delta) {
//     fb.PlaybackTime = fb.PlaybackTime + delta * 2;
// }

window.SetInterval(function() {
    if (info.seek_flag) {
        if (fb.PlaybackTime < info.seek_time + 1 && fb.PlaybackTime > info.seek_time - 1) {
            info.seek_flag = false;
        } else {
            fb.PlaybackTime = info.seek_time;
        }
    }
    if (!g_drag) {
        if (g_length > 0) {
            g_pos = (ww - bar_end_padding * 2) * fb.PlaybackTime / g_length;
        }
        window.Repaint();
    }
}, 100);

function on_playlist_items_added(playlist) {
    if (fb.GetPlaylistName(playlist).search('Quicksearch') != -1) {
        plman.SortByFormatV2(playlist, "%tracknumber%");
        plman.SortByFormatV2(playlist, "%album%");
    }
}

if (fb.IsPlaying) on_playback_new_track();