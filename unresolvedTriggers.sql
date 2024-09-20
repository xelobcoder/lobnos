BEGIN


INSERT INTO billinghx(billingid,employeeid) VALUE (NEW.billingid,NEW.employeeid);


END


BEGIN 


DELETE FROM performing_test WHERE BILLINGID = OLD.BILLINGID;


DELETE FROM test_ascension WHERE billingid = OLD.BILLINGID;


DELETE FROM billinghx WHERE billingid = OLD.BILLINGID;


DELETE FROM samplestatus WHERE billingid = OLD.BILLINGID;


END