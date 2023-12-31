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
var seekbar_clickable_height = 35;
var tmp_seek_duration = 35;
var incremental_random_flag = false;
var persistant_stop_after_current_flag = false;
var force_next_flag = false;
var seek_on_out_of_range_flag = false;
var seek_on_out_of_range_time = Number.MAX_VALUE;
var default_cursor = IDC_ARROW;
var FindLowestPlayCountItem = function(playlist_index, current_item) {
    var items = plman.GetPlaylistItems(playlist_index);
    var next_candidates = new Array();
    var lowest_playcount = Number.MAX_VALUE;
    var current_item_playcount;
    var nowplaying_path = "";
    try {
        nowplaying_path = current_item.RawPath;
    } catch(exception) {
    }

    for (var i = 0; i < items.Count; i++) {
        current_item_playcount = Math.floor(fb.Titleformat("%play_count%").EvalWithMetadb(items.Item(i)));
        if (current_item_playcount < lowest_playcount) {
            lowest_playcount = current_item_playcount;
            next_candidates = new Array();
        }
        if (current_item_playcount === lowest_playcount && items.Item(i).RawPath !== nowplaying_path) {
            next_candidates.push(i);
        }
    }

    var next_item = next_candidates[Math.floor(Math.random() * next_candidates.length)];
    fb.trace("next: " + items.Item(next_item).Path);

    return next_item;
};
var SeekMetadataRange = function() {
    var match;
    var range = fb.GetNowPlaying().GetFileInfo().MetaValue(fb.GetNowPlaying().GetFileInfo().MetaFind("RANGE"), 0);
    if ((match = range.match(/^([0-9\.]+)-/)) !== null) {
        fb.PlaybackTime = match[1];
    }
    if ((match = range.match(/-([0-9\.]+)$/)) !== null) {
        seek_on_out_of_range_flag = true;
        seek_on_out_of_range_time = match[1];
    }
};
var DoNextAction = function() {
    var items = plman.GetPlaylistItems(plman.PlayingPlaylist);
    var current_handle = fb.GetNowPlaying();
    var next_index = -1;

    if (!incremental_random_flag && !persistant_stop_after_current_flag && fb.PlaybackOrder == 0) {
        // Default
        next_index = items.Find(current_handle) + 1;
    } else if (!incremental_random_flag && !persistant_stop_after_current_flag && fb.PlaybackOrder == 4) {
        // Shuffle
        next_index = Math.floor(Math.random() * items.Count);
    } else if (incremental_random_flag){
        // Incremental shuffle
        next_index = FindLowestPlayCountItem(plman.PlayingPlaylist, current_handle);
    } else if (!persistant_stop_after_current_flag && fb.PlaybackOrder == 2) {
        // Repeat
        next_index = items.Find(current_handle);
    } else if (persistant_stop_after_current_flag) {
        // Play Once
    }

    if (next_index >= 0 && next_index < items.Count) {
        fb.RunContextCommandWithMetadb("Play", items.Item(next_index));
        fb.trace("action next index: " + next_index);
        fb.trace("action next: " + items.Item(next_index).Path);
        fb.trace("action next title: :" + items.Item(next_index).GetFileInfo().MetaValue(items.Item(next_index).GetFileInfo().MetaFind("TITLE"), 0))
    } else {
        fb.RunMainMenuCommand("Playback/Stop");
        fb.trace("action next: Stop");
    }
    force_next_flag = false;
};
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
        fb.trace(fb.PlaybackTime);
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
        gdi.Image(fb.FoobarPath + "icon/random_incremental.png"),
        gdi.Image(fb.FoobarPath + "icon/random_transparent.png"),
    ],
    scale: 0.25,
    w_offset: -220,
    h_offset: 20,
    click_func: function() {
        if (fb.PlaybackOrder == 4) {
            fb.PlaybackOrder = 0;
            persistant_stop_after_current_flag = false;
            incremental_random_flag = true;
            force_next_flag = true;
            plman.FlushPlaybackQueue();

            var next_item = FindLowestPlayCountItem(plman.ActivePlaylist, fb.GetNowPlaying());
            plman.AddPlaylistItemToPlaybackQueue(plman.ActivePlaylist, next_item);
        } else if (incremental_random_flag) {
            fb.PlaybackOrder = 0;
            persistant_stop_after_current_flag = false;
            incremental_random_flag = false;
            force_next_flag = true;
            plman.FlushPlaybackQueue();
        } else {
            fb.PlaybackOrder = 4;
            persistant_stop_after_current_flag = false;
            incremental_random_flag = false;
            force_next_flag = true;
            plman.FlushPlaybackQueue();
        }
    },
    select_draw_img_func: function() {
        if (fb.PlaybackOrder == 4) {
            return 0;
        } else if (incremental_random_flag) {
            return 1;
        } else {
            return 2;
        }
    },
};
var repeat = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/stop_after_current.png"),
        gdi.Image(fb.FoobarPath + "icon/repeat.png"),
        gdi.Image(fb.FoobarPath + "icon/repeat_transparent.png"),
    ],
    scale: 0.25,
    w_offset: 140,
    h_offset: 20,
    click_func: function() {
        if (persistant_stop_after_current_flag) {
            fb.PlaybackOrder = 2;
            fb.StopAfterCurrent = false;
            persistant_stop_after_current_flag = false;
            incremental_random_flag = false;
            force_next_flag = true;
        } else if (fb.PlaybackOrder == 2)  {
            fb.PlaybackOrder = 0;
            fb.StopAfterCurrent = false;
            persistant_stop_after_current_flag = false;
            incremental_random_flag = false;
            force_next_flag = true;
        } else {
            fb.PlaybackOrder = 0;
            fb.StopAfterCurrent = true;
            persistant_stop_after_current_flag = true;
            incremental_random_flag = false;
            force_next_flag = true;
        }
    },
    select_draw_img_func: function() {
        if (persistant_stop_after_current_flag) {
            return 0;
        } else if (fb.PlaybackOrder == 2)  {
            return 1;
        } else {
            return 2;
        }
    },
};
var speed = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/x2.png"),
        gdi.Image(fb.FoobarPath + "icon/x2_transparent.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.75.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.75_transparent.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.5.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.5_transparent.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.25.png"),
        gdi.Image(fb.FoobarPath + "icon/x1.25_transparent.png"),
        gdi.Image(fb.FoobarPath + "icon/x0.75.png"),
        gdi.Image(fb.FoobarPath + "icon/x0.75_transparent.png"),
        gdi.Image(fb.FoobarPath + "icon/x0.5.png"),
        gdi.Image(fb.FoobarPath + "icon/x0.5_transparent.png"),
    ],
    scale: 0.3,
    w_offset: 210,
    h_offset: 18,
    click_func: function(info) {
        if (info.speed != info.target_speed) {
            info.speed = info.target_speed;
            if (fb.PlaybackTime > tmp_seek_duration) {
                info.first_seek_time = clamp(fb.PlaybackTime - tmp_seek_duration, 0, fb.PlaybackLength - 1);
            } else {
                info.first_seek_time = clamp(fb.PlaybackTime + tmp_seek_duration, 0, fb.PlaybackLength - 1);
            }
            info.second_seek_time = fb.PlaybackTime;
            info.seek_flag = 2;

            //JavaScriptはIEEE754という精度らしく、正確な算術ができないことに注意
            if (info.target_speed == 1.26 || info.target_speed == 1.51 || info.target_speed == 1.76 || info.target_speed == 2.01) {
                fb.RunMainMenuCommand("Playback/DSP settings/Speed x" + ((Math.round(info.target_speed * 100) - 1) / 100) + " Skip Silence");
            } else {
                fb.RunMainMenuCommand("Playback/DSP settings/Speed x" + info.target_speed);
            }
        } else {
            info.speed = 1.0;
            if (fb.PlaybackTime > tmp_seek_duration) {
                info.first_seek_time = clamp(fb.PlaybackTime - tmp_seek_duration, 0, fb.PlaybackLength - 1);
            } else {
                info.first_seek_time = clamp(fb.PlaybackTime + tmp_seek_duration, 0, fb.PlaybackLength - 1);
            }
            info.second_seek_time = fb.PlaybackTime;
            info.seek_flag = 2;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
        }
        return info;
    },
    right_click_func: function(x, y, info) {
        var menu = window.CreatePopupMenu();

        menu.AppendMenuItem(MF_STRING, 201, "x2.0 Skip Silence");
        menu.AppendMenuItem(MF_STRING, 176, "x1.75 Skip Silence");
        menu.AppendMenuItem(MF_STRING, 151, "x1.5 Skip Silence");
        menu.AppendMenuItem(MF_STRING, 126, "x1.25 Skip Silence");
        menu.AppendMenuItem(MF_STRING, 200, "x2.0");
        menu.AppendMenuItem(MF_STRING, 175, "x1.75");
        menu.AppendMenuItem(MF_STRING, 150, "x1.5");
        menu.AppendMenuItem(MF_STRING, 125, "x1.25");
        menu.AppendMenuItem(MF_STRING, 75, "x0.75");
        menu.AppendMenuItem(MF_STRING, 50, "x0.5");
        menu.CheckMenuRadioItem(1, 200, info.target_speed * 100);

        var ret = menu.TrackPopupMenu(x, y);
        menu.Dispose();
        if (ret == 0) {
            return info;
        }
        info.target_speed = ret / 100;

        return info;
    },
    select_draw_img_func: function(info) {
        switch (info.target_speed) {
            case 2.01:
                if (info.speed == info.target_speed) {
                    return 0;
                } else {
                    return 1;
                }
                break;
            case 1.76:
                if (info.speed == info.target_speed) {
                    return 2;
                } else {
                    return 3;
                }
                break;
            case 1.51:
                if (info.speed == info.target_speed) {
                    return 4;
                } else {
                    return 5;
                }
                break;
            case 1.26:
                if (info.speed == info.target_speed) {
                    return 6;
                } else {
                    return 7;
                }
                break;
            case 2:
                if (info.speed == info.target_speed) {
                    return 0;
                } else {
                    return 1;
                }
                break;
            case 1.75:
                if (info.speed == info.target_speed) {
                    return 2;
                } else {
                    return 3;
                }
                break;
            case 1.5:
                if (info.speed == info.target_speed) {
                    return 4;
                } else {
                    return 5;
                }
                break;
            case 1.25:
                if (info.speed == info.target_speed) {
                    return 6;
                } else {
                    return 7;
                }
                break;
            case 0.75:
                if (info.speed == info.target_speed) {
                    return 8;
                } else {
                    return 9;
                }
                break;
            case 0.5:
                if (info.speed == info.target_speed) {
                    return 10;
                } else {
                    return 11;
                }
                break;
            default:
                return 5;
                break;
        }
    },
};
var mono_stereo = {
    img_list: [
        gdi.Image(fb.FoobarPath + "icon/mono_consolas.png"),
        gdi.Image(fb.FoobarPath + "icon/stereo_consolas.png"),
    ],
    scale: 0.3,
    w_offset: -300,
    h_offset: 18,
    click_func: function(info) {
        if (!info.mono) {
            info.mono = true;
            if (fb.PlaybackTime > tmp_seek_duration) {
                info.first_seek_time = clamp(fb.PlaybackTime - tmp_seek_duration, 0, fb.PlaybackLength - 1);
            } else {
                info.first_seek_time = clamp(fb.PlaybackTime + tmp_seek_duration, 0, fb.PlaybackLength - 1);
            }
            info.second_seek_time = fb.PlaybackTime;
            info.seek_flag = 2;
            fb.RunMainMenuCommand("Playback/DSP settings/Mono");
        } else {
            info.mono = false;
            if (fb.PlaybackTime > tmp_seek_duration) {
                info.first_seek_time = clamp(fb.PlaybackTime - tmp_seek_duration, 0, fb.PlaybackLength - 1);
            } else {
                info.first_seek_time = clamp(fb.PlaybackTime + tmp_seek_duration, 0, fb.PlaybackLength - 1);
            }
            info.second_seek_time = fb.PlaybackTime;
            info.seek_flag = 2;
            fb.RunMainMenuCommand("Playback/DSP settings/Default");
        }
        return info;
    },
    select_draw_img_func: function(info) {
        if (!info.mono) {
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
    target_speed: 1.5,
    seek_flag: 0,
    first_seek_time: 0,
    second_seek_time: 0,
    prev_volume: 0,
    mono: false,
};
var center_w;
var center_h;
var right_w;
var ww = 0;
var wh = 0;
var g_pos = 0;
var g_drag = false;
var g_length = 1;
var g_tooltip = window.CreateTooltip();
var g_trackingMouse = false;


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
    center_buttons.add(speed);
    center_buttons.add(mono_stereo);

    right_buttons = new Buttons(ww - bar_end_padding + bar_end_padding * 1 / 3, center_h);
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

function on_mouse_rbtn_down(x, y) {
    if (center_buttons.is_buttons_on_mouse(x, y)) {
        info = center_buttons.mouse_rbtn_down(x, y, info);
    }
}

function on_mouse_lbtn_up(x, y) {
    if (
        g_length > 0 &&
        g_drag &&
        x > bar_end_padding &&
        x < ww - bar_end_padding &&
        y > wh - seekbar_clickable_height
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
        x > bar_end_padding &&
        x < ww - bar_end_padding &&
        y > wh - seekbar_clickable_height
    ) {
        if (g_drag) {
            g_pos = x - bar_end_padding;
            window.Repaint();
        }
        if (!g_trackingMouse) {
            g_tooltip.Activate();
            g_tooltip.TrackActivate = true;
            g_trackingMouse = true;
        }
        g_tooltip.Text = format_length(g_length * (x - bar_end_padding) / (ww - bar_end_padding * 2));
        g_tooltip.TrackPosition(x + 10, y + 20);
    } else {
        if (g_trackingMouse) {
            g_trackingMouse = false;
            g_tooltip.TrackActivate = false;
        }
    }
}

function on_mouse_leave() {
    g_trackingMouse = false;
    g_tooltip.TrackActivate = false;
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

    plman.FlushPlaybackQueue();
    if (incremental_random_flag) {
        var next_item = FindLowestPlayCountItem(plman.ActivePlaylist, fb.GetNowPlaying());
        plman.AddPlaylistItemToPlaybackQueue(plman.ActivePlaylist, next_item);
    }
    if (persistant_stop_after_current_flag) {
        fb.StopAfterCurrent = true;
    }
    fb.trace("on_playback_new_track()");
    fb.trace("time: " + fb.PlaybackTime);
    seek_on_out_of_range_flag = false;
    seek_on_out_of_range_time = Number.MAX_VALUE;
    if (fb.GetNowPlaying() && fb.PlaybackTime < 1) {
        SeekMetadataRange();
    }
    window.Repaint();
}

// function on_mouse_wheel(delta) {
//     fb.PlaybackTime = fb.PlaybackTime + delta * 2;
// }

window.SetInterval(function() {
    if (info.seek_flag == 2) {
        if (fb.PlaybackTime < info.first_seek_time + 1 && fb.PlaybackTime > info.first_seek_time - 1) {
            info.seek_flag = 1;
        } else {
            fb.PlaybackTime = info.first_seek_time;
        }
    }
    if (info.seek_flag == 1) {
        if (fb.PlaybackTime < info.second_seek_time + 1 && fb.PlaybackTime > info.second_seek_time - 1) {
            info.seek_flag = 0;
        } else {
            fb.PlaybackTime = info.second_seek_time;
        }
    }
    if (force_next_flag && fb.PlaybackLength > 0.5 && fb.PlaybackTime > (fb.PlaybackLength - 0.5)) {
        DoNextAction();
    }
    if (seek_on_out_of_range_flag && fb.PlaybackTime >= seek_on_out_of_range_time) {
        seek_on_out_of_range_flag = false;
        seek_on_out_of_range_time = Number.MAX_VALUE;
        DoNextAction();
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