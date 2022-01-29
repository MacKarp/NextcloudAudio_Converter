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
                    var title = "Titre";
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
                        + '</p>'
                        + '<br>'
                        + '<div class="checkbox-container">'
                        + '</div></div>'
                        + '<p class="vc-label urldisplay" id="text" style="display: inline; margin-right: 10px;">'
                        + t('audio_converter', 'Choose the output format:')
                        + ' <em></em>'
                        + '</p>'
                        + '<div class="oc-dialog-buttonrow boutons" id="buttons">'
                        + '<a class="button primary" id="mp3">' + t('audio_converter', '.MP3') + '</a>'
                        + '<a class="button primary" id="ogg">' + t('audio_converter', '.OGG') + '</a>'
                        + '<a class="button primary" id="m4a">' + t('audio_converter', '.M4A') + '</a>'
                        + '<a class="button primary" id="wav">' + t('audio_converter', '.WAV') + '</a>'
                        + '</div>'
                    );
                    var finished = false;
                    document.getElementById("btnClose").addEventListener("click", function () {
                        close();
                        finished = true;
                    });        
                    document.getElementById("linkeditor_overlay").addEventListener("click", function () {
                        close();
                        finished = true;
                    });
                    var fileExt = filename.split('.').pop();
                    var types = ['ogg', 'mp3', 'm4a', 'wav'];
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
                                        mtime: context.fileInfoModel.attributes.mtime,
                                    };
                                } else {
                                    var data = {
                                        nameOfFile: filename,
                                        directory: context.dir,
                                        external: 0,
                                        type: $element.target.id,
                                        shareOwner: context.fileList.dirInfo.shareOwnerId,
                                    };
                                }
                                var tr = context.fileList.findFileEl(filename);
                                context.fileList.showFileBusyState(tr, true);
                                $.ajax({
                                    type: "POST",
                                    async: "true",
                                    url: OC.filePath('audio_converter', 'ajax', 'convertHere.php'),
                                    data: data,
                                    beforeSend: function () {
                                        document.getElementById("loading").style.display = "block";
                                        document.getElementById("noteLoading").style.display = "block";
                                        document.getElementById("params").style.display = "none";
                                        document.getElementById("text").style.display = "none";
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
