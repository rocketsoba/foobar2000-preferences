// ==PREPROCESSOR==
// @name "seekbar and buttons"
// @author "rockyakisoba"
// @import "%fb2k_path%js\Flags.txt"
// @import "%fb2k_path%js\Helpers.txt"
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
var knob = {
    src: gdi.Image(fb.FoobarPath + "icon/seekbar_knob.png"),
    scale: 0.6,
    w_offset: - 16,
    h_offset: 0,
};
var play = {
    src: gdi.Image(fb.FoobarPath + "icon/play.png"),
    scale: 0.25,
    w_offset: 5,
    h_offset: 20,
};
var next = {
    src: gdi.Image(fb.FoobarPath + "icon/next.png"),
    scale: 0.25,
    w_offset: 90,
    h_offset: 20,
};
var previous = {
    src: gdi.Image(fb.FoobarPath + "icon/previous.png"),
    scale: 0.25,
    w_offset: -100,
    h_offset: 20,
};
var random = {
    src: gdi.Image(fb.FoobarPath + "icon/random.png"),
    src_transparent: gdi.Image(fb.FoobarPath + "icon/random_transparent.png"),
    scale: 0.25,
    w_offset: -190,
    h_offset: 20,
};
var repeat = {
    src: gdi.Image(fb.FoobarPath + "icon/repeat.png"),
    src_transparent: gdi.Image(fb.FoobarPath + "icon/repeat_transparent.png"),
    scale: 0.25,
    w_offset: 170,
    h_offset: 20,
};
var speed15 = {
    src: gdi.Image(fb.FoobarPath + "icon/x1.5.png"),
    src_transparent: gdi.Image(fb.FoobarPath + "icon/x1.5_transparent.png"),
    scale: 0.3,
    w_offset: 250,
    h_offset: 18,
};
var speed05 = {
    src: gdi.Image(fb.FoobarPath + "icon/x0.5.png"),
    src_transparent: gdi.Image(fb.FoobarPath + "icon/x0.5_transparent.png"),
    scale: 0.3,
    w_offset: -260,
    h_offset: 18,
};
var volume_button = {
    src: gdi.Image(fb.FoobarPath + "icon/volume.png"),
    scale: 0.2,
    w_offset: -30,
    h_offset: -22,
};

var center_height;
var center_width;
var speed = 1.0;
var seek_flag = false;
var seek_time = 0;
var prev_volume;
var ww = 0;
var wh = 0;
var g_pos = 0;
var g_drag = false;
var g_length = 1;


function on_size() {
    ww = window.Width;
    wh = window.Height;
}

function on_paint(gr) {
    window.MaxHeight = 120;
    center_height = wh * y_position_ratio;
    center_width = ww / 2;
    volume = vol2pos(fb.Volume) * 100;

    gr.FillSolidRect(0, 0, ww, wh, background_color);

    gr.FillSolidRect(bar_end_padding, center_height, ww - bar_end_padding * 2, bar_height, bar_color);
    gr.FillSolidRect(bar_end_padding, center_height, g_pos + knob.w_offset, bar_height, bar_played_color);
    gr.DrawImage(knob.src, g_pos + knob.w_offset + bar_end_padding, center_height - bar_w_offset, knob.src.Width * knob.scale, knob.src.Height * knob.scale, 0, 0, knob.src.Width, knob.src.Height);
    gr.DrawString(format_length(fb.PlaybackLength), text_font, text_color , ww - bar_end_padding + 10, center_height - 8, ww, wh);
    gr.DrawString(format_length(fb.PlaybackTime), text_font, text_color , bar_end_padding - 50, center_height - 8, ww, wh);
    gr.DrawImage(play.src, center_width - (play.src.Width * play.scale / 2) + play.w_offset, play.h_offset, play.src.Width * play.scale, play.src.Height * play.scale, 0, 0, play.src.Width, play.src.Height);
    gr.DrawImage(next.src, center_width - (next.src.Width * next.scale / 2) + next.w_offset, next.h_offset, next.src.Width * next.scale, next.src.Height * next.scale, 0, 0, next.src.Width, next.src.Height);
    gr.DrawImage(previous.src, center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset, previous.h_offset, previous.src.Width * previous.scale, previous.src.Height * previous.scale, 0, 0, previous.src.Width, previous.src.Height);
    if (fb.PlaybackOrder == 4) {
        gr.DrawImage(random.src, center_width - (random.src.Width * random.scale / 2) + random.w_offset, random.h_offset, random.src.Width * random.scale, random.src.Height * random.scale, 0, 0, random.src.Width, random.src.Height);
    } else {
        gr.DrawImage(random.src_transparent, center_width - (random.src_transparent.Width * random.scale / 2) + random.w_offset, random.h_offset, random.src_transparent.Width * random.scale, random.src_transparent.Height * random.scale, 0, 0, random.src_transparent.Width, random.src_transparent.Height);
    }
    if (fb.PlaybackOrder == 2) {
        gr.DrawImage(repeat.src, center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset, repeat.h_offset, repeat.src.Width * repeat.scale, repeat.src.Height * repeat.scale, 0, 0, repeat.src.Width, repeat.src.Height);
    } else {
        gr.DrawImage(repeat.src_transparent, center_width - (repeat.src_transparent.Width * repeat.scale / 2) + repeat.w_offset, repeat.h_offset, repeat.src_transparent.Width * repeat.scale, repeat.src_transparent.Height * repeat.scale, 0, 0, repeat.src_transparent.Width, repeat.src_transparent.Height);
    }
    if (speed == 1.5) {
        gr.DrawImage(speed15.src, center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset, speed15.h_offset, speed15.src.Width * speed15.scale, speed15.src.Height * speed15.scale, 0, 0, speed15.src.Width, speed15.src.Height);
    } else {
        gr.DrawImage(speed15.src_transparent, center_width - (speed15.src_transparent.Width * speed15.scale / 2) + speed15.w_offset, speed15.h_offset, speed15.src_transparent.Width * speed15.scale, speed15.src_transparent.Height * speed15.scale, 0, 0, speed15.src_transparent.Width, speed15.src_transparent.Height);
    }
    if (speed == 0.5) {
        gr.DrawImage(speed05.src, center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset, speed05.h_offset, speed05.src.Width * speed05.scale, speed05.src.Height * speed05.scale, 0, 0, speed05.src.Width, speed05.src.Height);
    } else {
        gr.DrawImage(speed05.src_transparent, center_width - (speed05.src_transparent.Width * speed05.scale / 2) + speed05.w_offset, speed05.h_offset, speed05.src_transparent.Width * speed05.scale, speed05.src_transparent.Height * speed05.scale, 0, 0, speed05.src_transparent.Width, speed05.src_transparent.Height);
    }
    gr.DrawImage(volume_button.src, ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset, wh / 2 + volume_button.h_offset, volume_button.src.Width * volume_button.scale, volume_button.src.Height * volume_button.scale, 0, 0, volume_button.src.Width, volume_button.src.Height);
    gr.FillSolidRect(ww - bar_end_padding + bar_end_padding * 1 / 3, wh / 2, bar_end_padding * 1 / 3, bar_height, bar_color);
    gr.FillSolidRect(ww - bar_end_padding + bar_end_padding * 1 / 3, wh / 2, volume / 100 * bar_end_padding * 1 / 3, bar_height, bar_played_color);
}

function on_mouse_lbtn_down(x, y) {
    if (
        x > center_width - (play.src.Width * play.scale / 2) + play.w_offset &&
        x < center_width - (play.src.Width * play.scale / 2) + play.w_offset + play.src.Width * play.scale &&
        y > play.h_offset &&
        y < play.h_offset + play.src.Height * play.scale
    ) {
        fb.PlayOrPause();
    } else if (
        x > center_width - (next.src.Width * next.scale / 2) + next.w_offset &&
        x < center_width - (next.src.Width * next.scale / 2) + next.w_offset + next.src.Width * next.scale &&
        y > next.h_offset &&
        y < next.h_offset + next.src.Height * next.scale
    ) {
        fb.Next();
    } else if (
        x > center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset &&
        x < center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset + previous.src.Width * previous.scale &&
        y > previous.h_offset &&
        y < previous.h_offset + previous.src.Height * previous.scale
    ) {
        fb.Prev();
    } else if (
        x > center_width - (random.src.Width * random.scale / 2) + random.w_offset &&
        x < center_width - (random.src.Width * random.scale / 2) + random.w_offset + random.src.Width * random.scale &&
        y > random.h_offset &&
        y < random.h_offset + random.src.Height * random.scale
    ) {
        if (fb.PlaybackOrder == 4) {
            fb.PlaybackOrder = 0;
        } else {
            fb.PlaybackOrder = 4;
        }
    } else if (
        x > center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset &&
        x < center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset + repeat.src.Width * repeat.scale &&
        y > repeat.h_offset &&
        y < repeat.h_offset + repeat.src.Height * repeat.scale
    ) {
        if (fb.PlaybackOrder == 2) {
            fb.PlaybackOrder = 0;
        } else {
            fb.PlaybackOrder = 2;
        }
    } else if (
        x > center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset &&
        x < center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset + speed15.src.Width * speed15.scale &&
        y > speed15.h_offset &&
        y < speed15.h_offset + speed15.src.Height * speed15.scale
    ) {
        if (speed != 1.5) {
            speed = 1.5;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Speed x1.5");
            fb.Stop();
            fb.Play();
        } else {
            speed = 1.0;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
            fb.Stop();
            fb.Play();
        }
    } else if (
        x > center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset &&
        x < center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset + speed05.src.Width * speed05.scale &&
        y > speed05.h_offset &&
        y < speed05.h_offset + speed05.src.Height * speed05.scale
    ) {
        if (speed != 0.5) {
            speed = 0.5;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Speed x0.5");
            fb.Stop();
            fb.Play();
        } else {
            speed = 1.0;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
            fb.Stop();
            fb.Play();
        }
    } else if (
        x > ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset &&
        x < ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset + volume_button.src.Width * volume_button.scale &&
        y > wh / 2 + volume_button.h_offset &&
        y < wh / 2 + volume_button.h_offset + volume_button.src.Height * volume_button.scale
    ) {
        if (fb.Volume != -100) {
            prev_volume = fb.Volume;
            fb.Volume = -100;
        } else {
            fb.Volume = prev_volume;
        }
    } else {
        if (g_length > 0) {
            g_drag = true;
            on_mouse_move(x, y);
        }
    }
}

function on_mouse_rbtn_dblclk(x, y) {
    if (
        x > center_width - (play.src.Width * play.scale / 2) + play.w_offset &&
        x < center_width - (play.src.Width * play.scale / 2) + play.w_offset + play.src.Width * play.scale &&
        y > play.h_offset &&
        y < play.h_offset + play.src.Height * play.scale
    ) {
        fb.PlayOrPause();
    } else if (
        x > center_width - (next.src.Width * next.scale / 2) + next.w_offset &&
        x < center_width - (next.src.Width * next.scale / 2) + next.w_offset + next.src.Width * next.scale &&
        y > next.h_offset &&
        y < next.h_offset + next.src.Height * next.scale
    ) {
        fb.Next();
    } else if (
        x > center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset &&
        x < center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset + previous.src.Width * previous.scale &&
        y > previous.h_offset &&
        y < previous.h_offset + previous.src.Height * previous.scale
    ) {
        fb.Prev();
    } else if (
        x > center_width - (random.src.Width * random.scale / 2) + random.w_offset &&
        x < center_width - (random.src.Width * random.scale / 2) + random.w_offset + random.src.Width * random.scale &&
        y > random.h_offset &&
        y < random.h_offset + random.src.Height * random.scale
    ) {
        if (fb.PlaybackOrder == 4) {
            fb.PlaybackOrder = 0;
        } else {
            fb.PlaybackOrder = 4;
        }
    } else if (
        x > center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset &&
        x < center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset + repeat.src.Width * repeat.scale &&
        y > repeat.h_offset &&
        y < repeat.h_offset + repeat.src.Height * repeat.scale
    ) {
        if (fb.PlaybackOrder == 2) {
            fb.PlaybackOrder = 0;
        } else {
            fb.PlaybackOrder = 2;
        }
    } else if (
        x > center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset &&
        x < center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset + speed15.src.Width * speed15.scale &&
        y > speed15.h_offset &&
        y < speed15.h_offset + speed15.src.Height * speed15.scale
    ) {
        if (speed != 1.5) {
            speed = 1.5;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Speed x1.5");
            fb.Stop();
            fb.Play();
        } else {
            speed = 1.0;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
            fb.Stop();
            fb.Play();
        }
    } else if (
        x > center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset &&
        x < center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset + speed05.src.Width * speed05.scale &&
        y > speed05.h_offset &&
        y < speed05.h_offset + speed05.src.Height * speed05.scale
    ) {
        if (speed != 0.5) {
            speed = 0.5;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Speed x0.5");
            fb.Stop();
            fb.Play();
        } else {
            speed = 1.0;
            seek_time = fb.PlaybackTime;
            seek_flag = true;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
            fb.Stop();
            fb.Play();
        }
    } else if (
        x > ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset &&
        x < ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset + volume_button.src.Width * volume_button.scale &&
        y > wh / 2 + volume_button.h_offset &&
        y < wh / 2 + volume_button.h_offset + volume_button.src.Height * volume_button.scale
    ) {
        if (fb.Volume != -100) {
            prev_volume = fb.Volume;
            fb.Volume = -100;
        } else {
            fb.Volume = prev_volume;
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
    if (
        x > center_width - (play.src.Width * play.scale / 2) + play.w_offset &&
        x < center_width - (play.src.Width * play.scale / 2) + play.w_offset + play.src.Width * play.scale &&
        y > play.h_offset &&
        y < play.h_offset + play.src.Height * play.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > center_width - (next.src.Width * next.scale / 2) + next.w_offset &&
        x < center_width - (next.src.Width * next.scale / 2) + next.w_offset + next.src.Width * next.scale &&
        y > next.h_offset &&
        y < next.h_offset + next.src.Height * next.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset &&
        x < center_width - (previous.src.Width * previous.scale / 2) + previous.w_offset + previous.src.Width * previous.scale &&
        y > previous.h_offset &&
        y < previous.h_offset + previous.src.Height * previous.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > center_width - (random.src.Width * random.scale / 2) + random.w_offset &&
        x < center_width - (random.src.Width * random.scale / 2) + random.w_offset + random.src.Width * random.scale &&
        y > random.h_offset &&
        y < random.h_offset + random.src.Height * random.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset &&
        x < center_width - (repeat.src.Width * repeat.scale / 2) + repeat.w_offset + repeat.src.Width * repeat.scale &&
        y > repeat.h_offset &&
        y < repeat.h_offset + repeat.src.Height * repeat.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset &&
        x < center_width - (speed15.src.Width * speed15.scale / 2) + speed15.w_offset + speed15.src.Width * speed15.scale &&
        y > speed15.h_offset &&
        y < speed15.h_offset + speed15.src.Height * speed15.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset &&
        x < center_width - (speed05.src.Width * speed05.scale / 2) + speed05.w_offset + speed05.src.Width * speed05.scale &&
        y > speed05.h_offset &&
        y < speed05.h_offset + speed05.src.Height * speed05.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else if (
        x > ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset &&
        x < ww - bar_end_padding + bar_end_padding * 1 / 3 - (volume_button.src.Width * volume_button.scale / 2) + volume_button.w_offset + volume_button.src.Width * volume_button.scale &&
        y > wh / 2 + volume_button.h_offset &&
        y < wh / 2 + volume_button.h_offset + volume_button.src.Height * volume_button.scale
    ) {
        window.SetCursor(IDC_HAND);
    } else {
        window.SetCursor(32512);
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
    if (seek_flag) {
        if (fb.PlaybackTime < seek_time + 3 && fb.PlaybackTime > seek_time - 3) {
            seek_flag = false;
        } else {
            fb.PlaybackTime = seek_time;
        }
    }
    if (!g_drag) {
        if (g_length > 0) {
            g_pos = (ww - bar_end_padding * 2) * fb.PlaybackTime / g_length;
        }
        window.Repaint();
    }
}, 100);

if (fb.IsPlaying) on_playback_new_track();