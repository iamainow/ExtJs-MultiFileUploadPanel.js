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
            '<div class="dropzone-icon">&#128194;</div>' +
            '<div class="dropzone-text">' + this.getDropZoneText() + '</div>' +
            '<div class="dropzone-hint">or use the button below</div>' +
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
            hideHeaders: false,
            emptyText: 'No files selected',
            columns: [
                {
                    text: 'File Name',
                    dataIndex: 'name',
                    flex: 2,
                    sortable: true
                },
                {
                    text: 'Size',
                    dataIndex: 'size',
                    width: 100,
                    sortable: true,
                    renderer: function(v) {
                        return me.formatFileSize(v);
                    }
                },
                {
                    text: 'Type',
                    dataIndex: 'type',
                    width: 120,
                    sortable: true,
                    renderer: function(v) {
                        return v || 'Unknown';
                    }
                },
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        iconCls: 'x-fa fa-trash',
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
            items: [
                me.fileButton,
                '->',
                {
                    itemId: 'removeAllBtn',
                    text: me.getRemoveButtonText(),
                    iconCls: 'x-fa fa-trash',
                    handler: me.clearFiles,
                    scope: me,
                    disabled: true
                },
                {
                    itemId: 'fileCount',
                    xtype: 'tbtext',
                    text: '0 files selected'
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
            countText.setText(count + ' file' + (count !== 1 ? 's' : '') + ' selected');
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
