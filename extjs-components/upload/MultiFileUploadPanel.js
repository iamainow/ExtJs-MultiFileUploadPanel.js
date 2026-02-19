/**
 * MultiFileUploadPanel - ExtJS 7.6 Classic Component
 * Drag-and-drop multi-file upload panel with queue management
 */
(function() {
    if (typeof Ext === 'undefined') {
        return;
    }
    
    Ext.define('Ext.ux.upload.MultiFileUploadPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.multifileupload',
    
    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.Action',
        'Ext.toolbar.Toolbar',
        'Ext.button.Button',
        'Ext.data.Store',
        'Ext.data.Model',
        'Ext.form.field.File',
        'Ext.layout.container.VBox'
    ],
    
    config: {
        accept: null,
        maxFileSize: null,
        maxFiles: null,
        dropZoneText: 'Drag and drop files here',
        buttonText: 'Browse Files',
        removeButtonText: 'Remove All'
    },
    
    /**
     * Maps file extensions/MIME types to Font Awesome icons and colors
     */
    fileTypeIcons: {
        // PDF
        pdf: { icon: 'fa-file-pdf-o', color: '#E53935' },
        // Images
        png: { icon: 'fa-file-image-o', color: '#43A047' },
        jpg: { icon: 'fa-file-image-o', color: '#43A047' },
        jpeg: { icon: 'fa-file-image-o', color: '#43A047' },
        gif: { icon: 'fa-file-image-o', color: '#43A047' },
        svg: { icon: 'fa-file-image-o', color: '#43A047' },
        webp: { icon: 'fa-file-image-o', color: '#43A047' },
        bmp: { icon: 'fa-file-image-o', color: '#43A047' },
        ico: { icon: 'fa-file-image-o', color: '#43A047' },
        // Word / Docs
        doc: { icon: 'fa-file-word-o', color: '#1565C0' },
        docx: { icon: 'fa-file-word-o', color: '#1565C0' },
        odt: { icon: 'fa-file-word-o', color: '#1565C0' },
        rtf: { icon: 'fa-file-word-o', color: '#1565C0' },
        // Excel / Spreadsheets
        xls: { icon: 'fa-file-excel-o', color: '#2E7D32' },
        xlsx: { icon: 'fa-file-excel-o', color: '#2E7D32' },
        csv: { icon: 'fa-file-excel-o', color: '#2E7D32' },
        // PowerPoint
        ppt: { icon: 'fa-file-powerpoint-o', color: '#D84315' },
        pptx: { icon: 'fa-file-powerpoint-o', color: '#D84315' },
        // Code
        js: { icon: 'fa-file-code-o', color: '#F9A825' },
        ts: { icon: 'fa-file-code-o', color: '#1976D2' },
        html: { icon: 'fa-file-code-o', color: '#E65100' },
        css: { icon: 'fa-file-code-o', color: '#1565C0' },
        json: { icon: 'fa-file-code-o', color: '#6D4C41' },
        xml: { icon: 'fa-file-code-o', color: '#6D4C41' },
        py: { icon: 'fa-file-code-o', color: '#1976D2' },
        java: { icon: 'fa-file-code-o', color: '#E53935' },
        // Archives
        zip: { icon: 'fa-file-archive-o', color: '#6D4C41' },
        rar: { icon: 'fa-file-archive-o', color: '#6D4C41' },
        '7z': { icon: 'fa-file-archive-o', color: '#6D4C41' },
        tar: { icon: 'fa-file-archive-o', color: '#6D4C41' },
        gz: { icon: 'fa-file-archive-o', color: '#6D4C41' },
        // Text
        txt: { icon: 'fa-file-text-o', color: '#546E7A' },
        md: { icon: 'fa-file-text-o', color: '#546E7A' },
        log: { icon: 'fa-file-text-o', color: '#546E7A' },
        // Audio
        mp3: { icon: 'fa-file-audio-o', color: '#8E24AA' },
        wav: { icon: 'fa-file-audio-o', color: '#8E24AA' },
        ogg: { icon: 'fa-file-audio-o', color: '#8E24AA' },
        flac: { icon: 'fa-file-audio-o', color: '#8E24AA' },
        // Video
        mp4: { icon: 'fa-file-video-o', color: '#D81B60' },
        avi: { icon: 'fa-file-video-o', color: '#D81B60' },
        mkv: { icon: 'fa-file-video-o', color: '#D81B60' },
        mov: { icon: 'fa-file-video-o', color: '#D81B60' },
        webm: { icon: 'fa-file-video-o', color: '#D81B60' }
    },
    
    /**
     * Returns icon info for a given filename
     */
    getFileIcon: function(fileName) {
        var ext = (fileName || '').split('.').pop().toLowerCase();
        return this.fileTypeIcons[ext] || { icon: 'fa-file-o', color: '#78909C' };
    },
    
    /**
     * Maps file type to a human-readable category label and color
     */
    getFileTypeBadge: function(mimeType, fileName) {
        var ext = (fileName || '').split('.').pop().toLowerCase();
        
        if (mimeType && mimeType.indexOf('image/') === 0) return { label: 'Image', cls: 'badge-image' };
        if (mimeType === 'application/pdf' || ext === 'pdf') return { label: 'PDF', cls: 'badge-pdf' };
        if (ext === 'doc' || ext === 'docx' || ext === 'odt' || ext === 'rtf') return { label: 'Document', cls: 'badge-doc' };
        if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return { label: 'Spreadsheet', cls: 'badge-spreadsheet' };
        if (ext === 'ppt' || ext === 'pptx') return { label: 'Presentation', cls: 'badge-presentation' };
        if (ext === 'js' || ext === 'ts' || ext === 'html' || ext === 'css' || ext === 'json' || ext === 'xml' || ext === 'py' || ext === 'java') return { label: 'Code', cls: 'badge-code' };
        if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || ext === 'gz') return { label: 'Archive', cls: 'badge-archive' };
        if (mimeType && mimeType.indexOf('audio/') === 0) return { label: 'Audio', cls: 'badge-audio' };
        if (mimeType && mimeType.indexOf('video/') === 0) return { label: 'Video', cls: 'badge-video' };
        if (mimeType && mimeType.indexOf('text/') === 0) return { label: 'Text', cls: 'badge-text' };
        
        return { label: ext.toUpperCase() || 'File', cls: 'badge-default' };
    },
    
    initComponent: function() {
        var me = this;
        
        me.fileModel = Ext.define(null, {
            extend: 'Ext.data.Model',
            fields: [
                { name: 'name', type: 'string' },
                { name: 'size', type: 'int' },
                { name: 'type', type: 'string' },
                { name: 'fileObject', type: 'auto' }
            ]
        });
        
        me.fileStore = Ext.create('Ext.data.Store', {
            model: me.fileModel
        });
        
        Ext.apply(me, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                me.createDropZone(),
                me.createFileGrid()
            ],
            dockedItems: [
                me.createToolbar()
            ]
        });
        
        me.callParent(arguments);
    },
    
    createDropZone: function() {
        var me = this;
        
        me.dropZone = Ext.create('Ext.Container', {
            itemId: 'dropZone',
            height: 120,
            cls: 'file-upload-dropzone',
            html: me.buildDropZoneHtml(),
            listeners: {
                afterrender: function() {
                    me.setupDropZoneEvents();
                }
            }
        });
        
        return me.dropZone;
    },
    
    buildDropZoneHtml: function() {
        return '<div class="dropzone-content">' +
            '<div class="dropzone-icon"><i class="fa fa-cloud-upload"></i></div>' +
            '<div class="dropzone-text">' + this.getDropZoneText() + '</div>' +
            '<div class="dropzone-hint">or use the button below</div>' +
            '<div class="dropzone-formats">' +
                '<span class="format-tag"><i class="fa fa-file-image-o"></i> Images</span>' +
                '<span class="format-tag"><i class="fa fa-file-pdf-o"></i> PDF</span>' +
                '<span class="format-tag"><i class="fa fa-file-word-o"></i> Docs</span>' +
                '<span class="format-tag"><i class="fa fa-file-code-o"></i> Code</span>' +
            '</div>' +
            '</div>';
    },
    
    setupDropZoneEvents: function() {
        var me = this,
            dropZoneEl = me.dropZone.getEl();
        
        dropZoneEl.on({
            dragenter: me.onDragEnter,
            dragover: me.onDragOver,
            dragleave: me.onDragLeave,
            drop: me.onDrop,
            scope: me
        });
    },
    
    createFileGrid: function() {
        var me = this;
        
        me.fileGrid = Ext.create('Ext.grid.Panel', {
            itemId: 'fileGrid',
            flex: 1,
            store: me.fileStore,
            cls: 'file-upload-grid',
            hideHeaders: false,
            emptyText: '<div class="empty-grid-message"><i class="fa fa-inbox"></i><br>No files selected</div>',
            viewConfig: {
                stripeRows: true,
                getRowClass: function() {
                    return 'file-grid-row';
                }
            },
            columns: [
                {
                    text: 'File Name',
                    dataIndex: 'name',
                    flex: 2,
                    sortable: true,
                    renderer: function(v) {
                        var iconInfo = me.getFileIcon(v);
                        return '<span class="file-name-cell">' +
                            '<i class="fa ' + iconInfo.icon + ' file-type-icon" style="color:' + iconInfo.color + '"></i>' +
                            '<span class="file-name-text">' + Ext.htmlEncode(v) + '</span>' +
                            '</span>';
                    }
                },
                {
                    text: 'Size',
                    dataIndex: 'size',
                    width: 110,
                    sortable: true,
                    renderer: function(v) {
                        return '<span class="file-size-cell">' + me.formatFileSize(v) + '</span>';
                    }
                },
                {
                    text: 'Type',
                    dataIndex: 'type',
                    width: 140,
                    sortable: true,
                    renderer: function(v, meta, record) {
                        var badge = me.getFileTypeBadge(v, record.get('name'));
                        return '<span class="file-type-badge ' + badge.cls + '">' + badge.label + '</span>';
                    }
                },
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        iconCls: 'x-fa fa-trash file-remove-btn',
                        tooltip: 'Remove file',
                        handler: function(grid, rowIndex) {
                            var record = grid.getStore().getAt(rowIndex);
                            me.removeFile(record.getId());
                        }
                    }]
                }
            ]
        });
        
        return me.fileGrid;
    },
    
    createToolbar: function() {
        var me = this;
        
        me.fileButton = Ext.create('Ext.form.field.File', {
            itemId: 'fileButton',
            buttonText: me.getButtonText(),
            buttonOnly: true,
            multiple: true,
            name: 'files',
            accept: me.getAccept(),
            listeners: {
                change: function(field, value) {
                    if (me._resettingFileInput) return;
                    me.handleFileSelect(field.fileInputEl.dom.files);
                    me._resettingFileInput = true;
                    field.reset();
                    me._resettingFileInput = false;
                }
            }
        });
        
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            cls: 'upload-toolbar',
            items: [
                me.fileButton,
                '->',
                {
                    itemId: 'fileCount',
                    xtype: 'tbtext',
                    cls: 'file-count-label',
                    text: '<span class="file-count-badge">0 files selected</span>'
                },
                '-',
                {
                    itemId: 'removeAllBtn',
                    text: me.getRemoveButtonText(),
                    iconCls: 'x-fa fa-times-circle',
                    cls: 'remove-all-btn',
                    handler: me.clearFiles,
                    scope: me,
                    disabled: true
                }
            ]
        };
    },
    
    cancelEvent: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    
    onDragEnter: function(e) {
        this.cancelEvent(e);
        this.dropZone.addCls('dropzone-active');
    },
    
    onDragOver: function(e) {
        this.cancelEvent(e);
    },
    
    onDragLeave: function(e) {
        this.cancelEvent(e);
        var relatedTarget = e.browserEvent.relatedTarget;
        if (!this.dropZone.getEl().contains(relatedTarget)) {
            this.dropZone.removeCls('dropzone-active');
        }
    },
    
    onDrop: function(e) {
        this.cancelEvent(e);
        this.dropZone.removeCls('dropzone-active');
        this.handleFileSelect(e.browserEvent.dataTransfer.files);
    },
    
    handleFileSelect: function(files) {
        var me = this,
            accept = me.getAccept(),
            maxFileSize = me.getMaxFileSize(),
            maxFiles = me.getMaxFiles(),
            currentCount = me.fileStore.getCount();
        
        if (!files || files.length === 0) return;
        
        if (maxFiles !== null && (currentCount + files.length) > maxFiles) {
            me.fireEvent('validationerror', 'Maximum ' + maxFiles + ' files allowed');
            return;
        }
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i],
                errors = [];
            
            if (me.fileStore.findExact('name', file.name) !== -1) {
                errors.push('File already added');
            }
            
            if (accept && !me.validateFileType(file, accept)) {
                errors.push('File type not allowed');
            }
            
            if (maxFileSize !== null && file.size > maxFileSize) {
                errors.push('File size exceeds ' + me.formatFileSize(maxFileSize));
            }
            
            if (errors.length > 0) {
                me.fireEvent('validationerror', file.name + ': ' + errors.join(', '));
                continue;
            }
            
            var record = Ext.create(me.fileModel, {
                name: file.name,
                size: file.size,
                type: file.type,
                fileObject: file
            });
            
            me.fileStore.add(record);
            me.fireEvent('fileadded', record);
        }
        
        me.updateFileCount();
        me.fireEvent('fileschanged', me.fileStore.getCount());
    },
    
    validateFileType: function(file, accept) {
        if (!accept) return true;
        
        var types = accept.split(',').map(function(t) { return t.trim(); }),
            fileName = file.name.toLowerCase(),
            fileType = file.type.toLowerCase();
        
        for (var i = 0; i < types.length; i++) {
            var type = types[i].toLowerCase();
            
            if (type.indexOf('/') !== -1) {
                if (type.endsWith('/*')) {
                    var category = type.split('/')[0];
                    if (fileType.startsWith(category + '/')) return true;
                } else {
                    if (fileType === type) return true;
                }
            } else if (type.startsWith('.')) {
                if (fileName.endsWith(type)) return true;
            } else {
                if (fileType === type || fileName.endsWith('.' + type)) return true;
            }
        }
        
        return false;
    },
    
    removeFile: function(recordId) {
        var me = this,
            record = me.fileStore.getById(recordId);
        
        if (record) {
            me.fileStore.remove(record);
            me.updateFileCount();
            me.fireEvent('fileremoved', record);
            me.fireEvent('fileschanged', me.fileStore.getCount());
        }
    },
    
    clearFiles: function() {
        var me = this;
        me.fileStore.removeAll();
        me.updateFileCount();
        me.fireEvent('filescleared');
        me.fireEvent('fileschanged', 0);
    },
    
    updateFileCount: function() {
        var me = this,
            countText = me.down('#fileCount'),
            removeAllBtn = me.down('#removeAllBtn'),
            count = me.fileStore.getCount();
        
        if (countText) {
            var label = count + ' file' + (count !== 1 ? 's' : '') + ' selected';
            countText.setText('<span class="file-count-badge' + (count > 0 ? ' has-files' : '') + '">' + label + '</span>');
        }
        if (removeAllBtn) {
            removeAllBtn.setDisabled(count === 0);
        }
    },
    
    getFiles: function() {
        var files = [];
        this.fileStore.each(function(record) {
            files.push(record.get('fileObject'));
        });
        return files;
    },
    
    getFileRecords: function() {
        return this.fileStore.getRange();
    },
    
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes) return '';
        
        var k = 1024,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    updateAccept: function(accept) {
        if (this.fileButton) {
            this.fileButton.accept = accept;
            if (this.fileButton.fileInputEl) {
                this.fileButton.fileInputEl.dom.accept = accept;
            }
        }
    }
});
})();
