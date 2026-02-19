/**
 * Example Controller for MultiFileUploadPanel
 * Demonstrates how to process uploaded files
 */
(function() {
    if (typeof Ext === 'undefined') {
        return;
    }
    
    Ext.define('Ext.ux.upload.UploadController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.fileupload',
    
    init: function() {
        var me = this,
            uploadPanel = me.lookupReference('uploadPanel');
        
        uploadPanel.on({
            fileadded: me.onFileAdded,
            fileremoved: me.onFileRemoved,
            fileschanged: me.onFilesChanged,
            filescleared: me.onFilesCleared,
            validationerror: me.onValidationError,
            scope: me
        });
    },
    
    onFileAdded: function(record) {
        console.log('File added:', record.get('name'));
    },
    
    onFileRemoved: function(record) {
        console.log('File removed:', record.get('name'));
    },
    
    onFilesChanged: function(count) {
        console.log('Files count changed:', count);
        var uploadBtn = this.lookupReference('uploadButton');
        if (uploadBtn) {
            uploadBtn.setDisabled(count === 0);
        }
    },
    
    onFilesCleared: function() {
        console.log('All files cleared');
    },
    
    onValidationError: function(message) {
        Ext.Msg.alert('Validation Error', message);
    },
    
    onUploadClick: function() {
        var me = this,
            uploadPanel = me.lookupReference('uploadPanel'),
            files = uploadPanel.getFiles(),
            records = uploadPanel.getFileRecords();
        
        if (files.length === 0) {
            Ext.Msg.alert('No Files', 'Please select files to upload');
            return;
        }
        
        Ext.Msg.confirm('Upload Files', 'Upload ' + files.length + ' file(s)?', function(btn) {
            if (btn === 'yes') {
                me.uploadFiles(files, records, uploadPanel);
            }
        });
    },
    
    uploadFiles: function(files, records, uploadPanel) {
        var me = this;
        
        for (var i = 0; i < files.length; i++) {
            me.uploadSingleFile(files[i], records[i], uploadPanel);
        }
    },
    
    uploadSingleFile: function(file, record, uploadPanel) {
        var me = this,
            formData = new FormData(),
            xhr = new XMLHttpRequest();
        
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size);
        formData.append('fileType', file.type);
        
        uploadPanel.updateRecordProgress(record.getId(), 0, 'uploading');
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                var percentComplete = Math.round((e.loaded / e.total) * 100);
                uploadPanel.updateRecordProgress(record.getId(), percentComplete);
            }
        });
        
        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                uploadPanel.updateRecordProgress(record.getId(), 100, 'complete');
                console.log('Upload complete:', file.name);
            } else {
                uploadPanel.markRecordError(record.getId(), 'Server error: ' + xhr.status);
                console.error('Upload failed:', file.name, xhr.status);
            }
        });
        
        xhr.addEventListener('error', function() {
            uploadPanel.markRecordError(record.getId(), 'Network error');
            console.error('Network error:', file.name);
        });
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    }
});
})();
