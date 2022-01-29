$(document).ready(function () {
    var actionsExtract = {
        init: function () {
            OCA.Files.fileActions.registerAction({
                name: 'convert',
                displayName: 'Convert into',
                mime: 'audio',
                permissions: OC.PERMISSION_UPDATE,
                type: OCA.Files.FileActions.TYPE_DROPDOWN,
                iconClass: 'icon-convert',
                actionHandler: function (filename, context) {
                    var a = context.$file[0].children[1].children[0].children[0].innerHTML;
                    var b = 'background-repeat:no-repeat;margin-right:1px;display: block;width: 40px;height: 32px;white-space: nowrap;border-image-repeat: stretch;border-image-slice: initial;background-size: 32px;';
                    var position = 30;
                    var output = [a.slice(0, position), b, a.slice(position)].join('');

                    var self = this;
                    var priority = "0";
                    var title = "Titre";
                    var acodec = null;
                    var abitrate = null;
                    var scaling = null;
                    var faststart = true;
                    $('body').append(
                        '<div id="linkeditor_overlay" class="oc-dialog-dim"></div>'
                        + '<div id="linkeditor_container" class="oc-dialog" style="position: fixed;">'
                        + '<div id="linkeditor">'
                        + '</div>'
                    );
                    $('#linkeditor').append(
                        '<div class="urledit push-bottom">'
                        + '<a class="oc-dialog-close" id="btnClose"></a>'
                        + '<h2 class="oc-dialog-title" style="display:flex;margin-right:30px;">'
                        + output
                        + filename
                        + '</h2>'
                        + '<div class="sk-circle" style="display:none" id="loading"><div class="sk-circle1 sk-child"></div><div class="sk-circle2 sk-child"></div><div class="sk-circle3 sk-child"></div><div class="sk-circle4 sk-child"></div><div class="sk-circle5 sk-child"></div><div class="sk-circle6 sk-child"></div><div class="sk-circle7 sk-child"></div><div class="sk-circle8 sk-child"></div><div class="sk-circle9 sk-child"></div><div class="sk-circle10 sk-child"></div><div class="sk-circle11 sk-child"></div><div class="sk-circle12 sk-child"></div></div>'
                        + '<div style="text-align:center; display:none; margin-top: 10px;" id="noteLoading">'
                        + '<p>Note: This could take a considerable amount of time depending on your hardware and the preset you chose. You can safely close this window.</p>'
                        + '</div>'
                        + '<div id="params">'
                        + '<p id="note">TEST Version 0.12</p>'
                        + '<br>'
                        + '<p class="vc-label urldisplay" id="labelPriority" style="display:inline-block; margin-right:5px;">'
                        + 'Priority'
                        + '</p>'
                        + '<select id="priority" style="margin-bottom: 10px;">'
                        + '<option value="-10">High</option>'
                        + '<option value="0">Normal (default)</option>'
                        + '<option value="10" selected>Low</option>'
                        + '</select>'
                        + '<br>'
                        + '<p class="vc-label urldisplay" id="labelCodec" style="display:inline-block; margin-right:5px;">'
                        + 'Codec'
                        + '</p>'
                        + '<select id="acodec" style="margin-bottom: 10px;">'
                        + '<option value="none">Auto</option>'
                        + '<option value="mp3">mp3</option>'
                        + '<option value="x265">HEVC</option>'
                        + '</select>'
                        + '<p class="vc-label urldisplay" id="labelBitrate" style="display:inline-block; margin-right:5px;">'
                        + 'Target bitrate'
                        + '</p>'
                        + '<select id="abitrate" style="margin-bottom: 10px;">'
                        + '<option value="none">Auto</option>'
                        + '<option value="1">1k</option>'
                        + '<option value="2">2k</option>'
                        + '<option value="3">3k</option>'
                        + '<option value="4">4k</option>'
                        + '<option value="5">5k</option>'
                        + '<option value="6">6k</option>'
                        + '<option value="7">7k</option>'
                        + '</select>'
                        + '<p class="vc-label urldisplay" id="labelBitrateUnit" style="display:inline-block; margin-right:5px;">'
                        + 'kbit/s'
                        + '</p>'
                        + '<br>'
                        + '<div class="checkbox-container">'
                        + '</div></div>'
                        + '<p class="vc-label urldisplay" id="text" style="display: inline; margin-right: 10px;">'
                        + t('video_converter', 'Choose the output format:')
                        + ' <em></em>'
                        + '</p>'
                        + '<div class="oc-dialog-buttonrow boutons" id="buttons">'
                        + '<a class="button primary" id="mp3">' + t('audio_converter', '.MP3') + '</a>'
                        + '<a class="button primary" id="avi">' + t('audio_converter', '.AVI') + '</a>'
                        + '<a class="button primary" id="m4v">' + t('audio_converter', '.M4V') + '</a>'
                        + '<a class="button primary" id="webm">' + t('audio_converter', '.WEBM') + '</a>'
                        + '</div>'
                    );
                    var finished = false;
                    document.getElementById("btnClose").addEventListener("click", function () {
                        close();
                        finished = true;
                    });
                    document.getElementById("priority").addEventListener("change", function (element) {
                        console.log(element.srcElement.value);
                        priority = element.srcElement.value;
                    });
                    document.getElementById("acodec").addEventListener("change", function (element) {
                        console.log(element.srcElement.value);
                        acodec = element.srcElement.value;
                        if (acodec === "none") {
                            acodec = null;
                        }
                    });
                    document.getElementById("abitrate").addEventListener("change", function (element) {
                        abitrate = element.srcElement.value;
                        if (abitrate === "none") {
                            abitrate = null;
                        }
                    });
                    document.getElementById("movflags").addEventListener("change", function (element) {
                        faststart = element.srcElement.checked;
                    });
                    document.getElementById("linkeditor_overlay").addEventListener("click", function () {
                        close();
                        finished = true;
                    });
                    var fileExt = filename.split('.').pop();
                    var types = ['avi', 'mp3', 'm4v', 'webm'];
                    types.forEach(type => {
                        if (type == fileExt) {
                            document.getElementById(type).setAttribute('style', 'background-color: lightgray; border-color:lightgray;');
                        } else {
                            document.getElementById(type).addEventListener("click", function ($element) {
                                if (context.fileInfoModel.attributes.mountType == "external") {
                                    var data = {
                                        nameOfFile: filename,
                                        directory: context.dir,
                                        external: 1,
                                        type: $element.target.id,
                                        priority: priority,
                                        movflags: faststart,
                                        codec: acodec,
                                        abitrate: abitrate,
                                        mtime: context.fileInfoModel.attributes.mtime,
                                    };
                                } else {
                                    var data = {
                                        nameOfFile: filename,
                                        directory: context.dir,
                                        external: 0,
                                        type: $element.target.id,
                                        priority: priority,
                                        movflags: faststart,
                                        codec: acodec,
                                        abitrate: abitrate,
                                        shareOwner: context.fileList.dirInfo.shareOwnerId,
                                    };
                                }
                                var tr = context.fileList.findFileEl(filename);
                                context.fileList.showFileBusyState(tr, true);
                                $.ajax({
                                    type: "POST",
                                    async: "true",
                                    url: OC.filePath('video_converter', 'ajax', 'convertHere.php'),
                                    data: data,
                                    beforeSend: function () {
                                        document.getElementById("loading").style.display = "block";
                                        document.getElementById("noteLoading").style.display = "block";
                                        document.getElementById("params").style.display = "none";
                                        document.getElementById("text").style.display = "none";
                                        document.getElementById("acodec").style.display = "none";
                                        document.getElementById("abitrate").style.display = "none";
                                        document.getElementById("labelCodec").style.display = "none";
                                        document.getElementById("labelBitrate").style.display = "none";
                                        document.getElementById("labelBitrateUnit").style.display = "none";
                                        document.getElementById("labelPriority").style.display = "none";
                                        document.getElementById("movflags").style.display = "none";
                                        document.getElementById("note").style.display = "none";
                                        document.getElementById("buttons").setAttribute('style', 'display: none !important');
                                    },
                                    success: function (element) {
                                        element = element.replace(/null/g, '');
                                        console.log(element);
                                        response = JSON.parse(element);
                                        if (response.code == 1) {
                                            this.filesClient = OC.Files.getClient();
                                            close();
                                            context.fileList.reload();
                                        } else {
                                            context.fileList.showFileBusyState(tr, false);
                                            close();
                                            OC.dialogs.alert(
                                                t('audio_converter', response.desc),
                                                t('audio_converter', 'Error converting ' + filename)
                                            );
                                        }
                                    }
                                });
                            });
                        }

                    });
                }
            });

        },
    }

    function close() {
        $('#linkeditor_container').remove();
        $('#linkeditor_overlay').remove();
    }
    actionsExtract.init();
});
